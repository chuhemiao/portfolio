#!/usr/bin/env python3
"""Fit supplied narration and Fish Audio effects to the fixed 290-second film."""

import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import time
import uuid


RATE = 48000
CHANNELS = 2
SECONDS = 290
SAMPLES = RATE * SECONDS
STARTS = [0, 28, 78, 130, 172, 212, 240, 270]
DURATIONS = [28, 50, 52, 42, 40, 28, 30, 20]
FFMPEG = os.environ.get("FFMPEG", "/opt/homebrew/bin/ffmpeg")
FFPROBE = os.environ.get("FFPROBE", "/opt/homebrew/bin/ffprobe")


class NeedsRetake(Exception):
    pass


def digest(file):
    h = hashlib.sha256()
    with Path(file).open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def write_json(file, value):
    file = Path(file)
    temp = file.with_name(f".{file.name}.{uuid.uuid4().hex}.tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    os.replace(temp, file)


def command(args, log=None, timeout=600):
    result = subprocess.run([str(arg) for arg in args], capture_output=True, text=True, timeout=timeout)
    if log:
        Path(log).write_text(json.dumps([str(arg) for arg in args]) + "\n\n" + result.stdout + "\n" + result.stderr)
    if result.returncode:
        raise RuntimeError(f"{args[0]} exited {result.returncode}: {result.stderr[-2500:]}")
    return result


def probe(file):
    return json.loads(command([FFPROBE, "-v", "error", "-show_format", "-show_streams", "-of", "json", file]).stdout)


def audio_info(file):
    data = probe(file)
    streams = [stream for stream in data["streams"] if stream["codec_type"] == "audio"]
    if len(streams) != 1:
        raise ValueError(f"Expected exactly one audio stream: {file}")
    stream = streams[0]
    duration = float(stream.get("duration", data["format"].get("duration", 0)))
    if not math.isfinite(duration) or duration <= 0:
        raise ValueError(f"Invalid audio duration: {file}")
    tags = {**data["format"].get("tags", {}), **stream.get("tags", {})}
    return {"path": str(file), "sha256": digest(file), "duration": duration,
            "sample_rate": int(stream["sample_rate"]), "channels": stream["channels"],
            "codec": stream["codec_name"], "tags": tags}


def loudness(file, filters="anull", log=None):
    result = command([FFMPEG, "-hide_banner", "-nostdin", "-i", file, "-vn", "-af",
                      filters + ",loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json",
                      "-c:a", "pcm_s16le", "-f", "null", "-"], log)
    blocks = re.findall(r'\{\s*"input_i"\s*:.*?\}', result.stderr, re.S)
    if not blocks:
        raise RuntimeError(f"Loudness measurement missing: {file}")
    measured = json.loads(blocks[-1])
    for key in ["input_i", "input_tp", "input_lra", "input_thresh", "target_offset"]:
        if not math.isfinite(float(measured[key])):
            raise NeedsRetake(f"Cannot measure useful non-silent audio: {file}")
    return measured


def normalize(file, output, filters="anull", target=-16, log_prefix=None, limiter=False):
    first = loudness(file, filters, None if log_prefix is None else str(log_prefix) + "-measure.log")
    params = [f"I={target}", "TP=-1.5", "LRA=9", f"measured_I={first['input_i']}",
              f"measured_TP={first['input_tp']}", f"measured_LRA={first['input_lra']}",
              f"measured_thresh={first['input_thresh']}", f"offset={first['target_offset']}",
              "linear=true", "print_format=summary"]
    chain = filters + ",loudnorm=" + ":".join(params)
    if limiter:
        chain += ",alimiter=limit=0.89125094:level=false:latency=true"
    command([FFMPEG, "-hide_banner", "-nostdin", "-y", "-i", file, "-vn", "-af", chain,
             "-ar", RATE, "-ac", CHANNELS, "-c:a", "pcm_s24le", output],
            None if log_prefix is None else str(log_prefix) + "-normalize.log")
    return first


def trim_bounds(file, duration, log):
    result = command([FFMPEG, "-hide_banner", "-nostdin", "-i", file, "-vn", "-af",
                      "silencedetect=noise=-48dB:d=0.12", "-c:a", "pcm_s16le", "-f", "null", "-"], log)
    intervals = []
    pending = None
    for kind, stamp in re.findall(r"silence_(start|end):\s*([\d.]+)", result.stderr):
        value = float(stamp)
        if kind == "start":
            pending = value
        elif pending is not None:
            intervals.append((pending, value))
            pending = None
    if pending is not None:
        intervals.append((pending, duration))
    start = 0.0
    end = duration
    if intervals and intervals[0][0] <= 0.02:
        start = max(0.0, intervals[0][1] - 0.06)
    if intervals and intervals[-1][1] >= duration - 0.03:
        end = min(duration, intervals[-1][0] + 0.08)
    if end - start < 0.15:
        raise NeedsRetake(f"Narration is empty after silence analysis: {file}")
    return start, end


def validate_wav(file):
    info = probe(file)
    stream = info["streams"][0]
    if len(info["streams"]) != 1 or stream["codec_type"] != "audio":
        raise ValueError(f"Expected a single audio stream: {file}")
    if stream["sample_rate"] != str(RATE) or stream["channels"] != CHANNELS:
        raise ValueError(f"Expected {RATE}Hz stereo: {file}")
    num, den = map(int, stream["time_base"].split("/"))
    if int(stream["duration_ts"]) * num * RATE != SAMPLES * den:
        raise ValueError(f"WAV duration is not exactly {SECONDS} seconds: {file}")
    return {"duration": float(stream["duration"]), "samples": SAMPLES,
            "sample_rate": RATE, "channels": CHANNELS, "sha256": digest(file)}


def publish(temp, output, overwrite):
    output = Path(output)
    if overwrite:
        os.replace(temp, output)
    else:
        os.link(temp, output)
        Path(temp).unlink()


def load_config(work):
    file = work / "narration.used.json"
    data = json.loads(file.read_text())
    scenes = data if isinstance(data, list) else data.get("scenes")
    if not isinstance(scenes, list) or len(scenes) != 8:
        raise ValueError("narration.used.json must be an array of 8 scenes or {scenes: [...]}")
    ordered = []
    for index, scene in enumerate(scenes):
        number = str(scene.get("scene", index + 1)).upper().removeprefix("S")
        if int(number) != index + 1:
            raise ValueError("Narration scenes must appear as 1/S1 through 8/S8")
        if abs(float(scene["start"]) - STARTS[index]) > 0.000001 or abs(float(scene["duration"]) - DURATIONS[index]) > 0.000001:
            raise ValueError(f"Scene {index + 1} differs from the frozen frame timeline")
        if not str(scene.get("text", "")).strip():
            raise ValueError(f"Scene {index + 1} has no frozen narration text")
        ordered.append(scene)
    service = "Fish Audio assets supplied by the operator" if isinstance(data, list) else data.get("source_service", "Fish Audio assets supplied by the operator")
    return ordered, {"path": str(file), "sha256": digest(file), "source_service": service}


def narration(work, run, args, report):
    scenes, binding = load_config(work)
    report["narration_config"] = binding
    missing = [str(work / "fish" / f"scene-{i:02d}.mp3") for i in range(1, 9)
               if not (work / "fish" / f"scene-{i:02d}.mp3").is_file()]
    if missing:
        report["missing_voice_files"] = missing
        raise FileNotFoundError("Missing Fish narration: " + ", ".join(missing))
    processed = []
    needs_retake = []
    for index, scene in enumerate(scenes):
        number = index + 1
        source = work / "fish" / f"scene-{number:02d}.mp3"
        info = audio_info(source)
        start, end = trim_bounds(source, info["duration"], run / f"scene-{number:02d}-silence.log")
        available = DURATIONS[index] - args.head_margin - args.tail_margin
        speed = max(1.0, (end - start) / (available - 0.04))
        row = {"scene": number, "scene_start": STARTS[index], "scene_duration": DURATIONS[index],
               "source": info, "trim_start": start, "trim_end": end,
               "trimmed_duration": end - start, "head_margin": args.head_margin,
               "minimum_tail_margin": args.tail_margin, "available_voice_seconds": available,
               "atempo": speed, "status": "planned"}
        report["scenes"].append(row)
        if speed > args.max_speed + 0.000001:
            row["status"] = "needs-retake"
            needs_retake.append({"scene": number, "required_speed": speed,
                                 "max_speed": args.max_speed, "available_seconds": available,
                                 "message": "Retake or shorten approved narration; speech will not be truncated."})
            continue
        output = run / f"scene-{number:02d}-voice.wav"
        filters = (f"atrim=start={start:.9f}:end={end:.9f},asetpts=PTS-STARTPTS,"
                   f"atempo={speed:.9f},aresample={RATE},aformat=channel_layouts=stereo")
        row["first_pass_loudness"] = normalize(source, output, filters, log_prefix=run / f"scene-{number:02d}")
        cooked = audio_info(output)
        if cooked["duration"] > available + 1 / RATE:
            row["status"] = "needs-retake"
            needs_retake.append({"scene": number, "processed_seconds": cooked["duration"],
                                 "available_seconds": available, "message": "Processed speech exceeds its window; not truncated."})
            continue
        row.update({"status": "fitted", "processed_duration": cooked["duration"],
                    "speech_start": STARTS[index] + args.head_margin,
                    "speech_end": STARTS[index] + args.head_margin + cooked["duration"],
                    "actual_tail_margin": DURATIONS[index] - args.head_margin - cooked["duration"],
                    "processed_sha256": cooked["sha256"]})
        assert row["speech_end"] <= STARTS[index] + DURATIONS[index] - args.tail_margin + 1 / RATE
        processed.append(output)
    if needs_retake:
        report["needs_retake"] = needs_retake
        raise NeedsRetake("One or more narration clips exceed the allowed speech window/speed")
    args_in = []
    chains = []
    labels = []
    for index, file in enumerate(processed):
        args_in += ["-i", file]
        delay = round((STARTS[index] + args.head_margin) * RATE)
        chains.append(f"[{index}:a]adelay=delays={delay}S:all=1[v{index}]")
        labels.append(f"[v{index}]")
    chains.append("".join(labels) + f"amix=inputs=8:normalize=0:dropout_transition=0,apad=whole_len={SAMPLES},atrim=end_sample={SAMPLES},asetpts=PTS-STARTPTS[voice]")
    timeline = run / "narration-timeline.wav"
    command([FFMPEG, "-hide_banner", "-nostdin", "-y", *args_in, "-filter_complex", ";".join(chains),
             "-map", "[voice]", "-ar", RATE, "-ac", CHANNELS, "-c:a", "pcm_s24le", timeline], run / "narration-timeline.log")
    report["narration_timeline"] = validate_wav(timeline)
    report["narration_loudness"] = loudness(timeline, log=run / "narration-loudness.log")
    return timeline


def effect_plan(files):
    accents = [(2.0, 0.55, "S1 first number"), (9.0, 0.55, "S1 eight minutes"),
               (16.0, 0.55, "S1 signature"), (139.4, 0.8, "S4 gap timer 3:24"),
               (175.6, 0.55, "S5 matching nonce"), (217.5, 0.85, "S6 $0.91"),
               (243.0, 0.75, "S7 frozen share")]
    transitions = [(float(start), 0.65, f"S{index + 1} transition")
                   for index, start in enumerate(STARTS) if index]
    return [{"file": files[index % len(files)], "time": when, "duration": duration, "cue": cue}
            for index, (when, duration, cue) in enumerate(sorted(accents + transitions))]


def mix(work, run, voice, args, report):
    effects = sorted(file for file in (work / "fish").glob("fx-*")
                     if file.is_file() and file.suffix.lower() in [".mp3", ".wav", ".m4a", ".ogg"])
    report["effects"] = {"status": "provided" if effects else "not-provided",
                         "voice_relative_gain_db": -args.fx_below_voice_db,
                         "declared_source_service": report["narration_config"]["source_service"],
                         "sources": [], "placements": []}
    effect_files = []
    for index, file in enumerate(effects):
        info = audio_info(file)
        normalized = run / f"fx-{index:02d}-normalized.wav"
        start, end = trim_bounds(file, info["duration"], run / f"fx-{index:02d}-silence.log")
        normalize(file, normalized, f"atrim=start={start:.9f}:end={end:.9f},asetpts=PTS-STARTPTS",
                  log_prefix=run / f"fx-{index:02d}")
        info["trim_start"] = start
        info["trim_end"] = end
        info["normalized_path"] = str(normalized)
        report["effects"]["sources"].append(info)
        effect_files.append(normalized)
    inputs = ["-i", voice]
    chains = ["[0:a]anull[voice]"]
    labels = ["[voice]"]
    for index, effect in enumerate(effect_files, 1):
        inputs += ["-i", effect]
    placements = effect_plan(effect_files) if effect_files else []
    splits = {}
    for index, placement in enumerate(placements):
        splits.setdefault(placement["file"], []).append(index)
    input_labels = {}
    for file, indices in splits.items():
        source_index = effect_files.index(file) + 1
        output_labels = [f"[rawfx{index}]" for index in indices]
        if len(indices) == 1:
            input_labels[indices[0]] = f"[{source_index}:a]"
        else:
            chains.append(f"[{source_index}:a]asplit={len(indices)}" + "".join(output_labels))
            input_labels.update({index: f"[rawfx{index}]" for index in indices})
    for index, placement in enumerate(placements):
        duration = min(placement["duration"], audio_info(placement["file"])["duration"])
        delay = round(placement["time"] * RATE)
        fade = min(0.14, duration / 3)
        chains.append(input_labels[index] + f"atrim=duration={duration:.6f},asetpts=PTS-STARTPTS,"
                      f"afade=t=in:d=0.018,afade=t=out:st={duration - fade:.6f}:d={fade:.6f},"
                      f"volume=-{args.fx_below_voice_db}dB,adelay=delays={delay}S:all=1[fx{index}]")
        labels.append(f"[fx{index}]")
        source_index = effect_files.index(placement["file"])
        report["effects"]["placements"].append({"source": str(effects[source_index]),
                                                 "time": placement["time"], "duration": duration,
                                                 "cue": placement["cue"]})
    if args.background:
        if not args.background_license:
            raise ValueError("--background requires --background-license with its permission/source description")
        background = args.background.resolve(strict=True)
        normalized = run / "background-normalized.wav"
        background_info = audio_info(background)
        loop_fade = min(0.2, background_info["duration"] / 4)
        normalize(background, normalized,
                  f"afade=t=in:d={loop_fade:.6f},afade=t=out:st={background_info['duration'] - loop_fade:.6f}:d={loop_fade:.6f}",
                  log_prefix=run / "background")
        background_index = len(effect_files) + 1
        inputs += ["-stream_loop", "-1", "-i", normalized]
        chains.append("[voice]asplit=2[voiceout][duckkey]")
        labels[0] = "[voiceout]"
        chains.append(f"[{background_index}:a]atrim=end_sample={SAMPLES},asetpts=PTS-STARTPTS,"
                      "volume=-23dB,afade=t=in:d=1.2,afade=t=out:st=287:d=3[quietbg]")
        chains.append("[quietbg][duckkey]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[bg]")
        labels.append("[bg]")
        report["background"] = {"source": audio_info(background), "permission": args.background_license,
                                "gain_db": -23, "voice_ducking": True, "loop_edge_fade_seconds": loop_fade}
    else:
        report["background"] = {"status": "not-provided"}
    raw = run / "mix-raw.wav"
    chains.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:dropout_transition=0,"
                  f"apad=whole_len={SAMPLES},atrim=end_sample={SAMPLES},asetpts=PTS-STARTPTS[mix]")
    command([FFMPEG, "-hide_banner", "-nostdin", "-y", *inputs, "-filter_complex", ";".join(chains),
             "-map", "[mix]", "-ar", RATE, "-ac", CHANNELS, "-c:a", "pcm_s24le", raw], run / "mix.log")
    normalized = run / "mix-normalized.wav"
    normalize(raw, normalized, log_prefix=run / "master", limiter=True)
    master = run / "mix-master.wav"
    command([FFMPEG, "-hide_banner", "-nostdin", "-y", "-i", normalized, "-af",
             f"apad=whole_len={SAMPLES},atrim=end_sample={SAMPLES},asetpts=PTS-STARTPTS",
             "-ar", RATE, "-ac", CHANNELS, "-c:a", "pcm_s24le", master], run / "master-length.log")
    report["mix_master"] = validate_wav(master)
    report["master_loudness"] = loudness(master, log=run / "master-final-measure.log")
    if float(report["master_loudness"]["input_tp"]) > -0.5:
        raise ValueError("Master exceeds the true-peak headroom limit")
    report["effects"]["missing_effects_notice"] = None if effects else "No Fish sound-effect files supplied; master contains narration only unless a licensed background was supplied."
    return master


def mux(video, audio, output, run, args, report):
    original = probe(video)
    streams = original["streams"]
    if len(streams) != 1 or streams[0]["codec_type"] != "video":
        raise ValueError("Input master must contain exactly one silent video stream")
    stream = streams[0]
    if stream["codec_name"] != "h264" or stream.get("pix_fmt") != "yuv420p":
        raise ValueError("Input silent master must be H.264 yuv420p")
    if (stream["width"], stream["height"], stream["avg_frame_rate"], int(stream.get("nb_frames", 0))) != (1920, 1080, "30/1", 8700):
        raise ValueError("Input video does not match 1920x1080 / 30fps / 8700 frames")
    if abs(float(stream["duration"]) - SECONDS) > 0.000001:
        raise ValueError("Input silent master duration is not exactly 290 seconds")
    output = output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    candidate = output.with_name(f".{output.stem}.{uuid.uuid4().hex}.mp4")
    source_hash = digest(video)
    try:
        command([FFMPEG, "-hide_banner", "-nostdin", "-y", "-i", video, "-i", audio,
                 "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k",
                 "-ar", RATE, "-ac", CHANNELS, "-t", SECONDS, "-movflags", "+faststart", candidate], run / "mux.log")
        final = probe(candidate)
        videos = [item for item in final["streams"] if item["codec_type"] == "video"]
        audios = [item for item in final["streams"] if item["codec_type"] == "audio"]
        if len(final["streams"]) != 2 or len(videos) != 1 or len(audios) != 1:
            raise ValueError("Final must contain exactly one video and one audio stream")
        out_video, out_audio = videos[0], audios[0]
        if out_video["codec_name"] != "h264" or out_video.get("pix_fmt") != "yuv420p":
            raise ValueError("Final video must remain H.264 yuv420p")
        if (out_video["width"], out_video["height"], out_video["avg_frame_rate"], int(out_video["nb_frames"])) != (1920, 1080, "30/1", 8700):
            raise ValueError("Final video geometry/frame count mismatch")
        if abs(float(final["format"]["duration"]) - SECONDS) > 0.000001 or abs(float(out_video["duration"]) - SECONDS) > 0.000001:
            raise ValueError("Final duration is not exactly 290 seconds")
        if out_audio["codec_name"] != "aac" or out_audio["sample_rate"] != str(RATE) or out_audio["channels"] != CHANNELS:
            raise ValueError("Final audio must be 48kHz stereo AAC")
        if abs(float(out_audio.get("duration", 0)) - SECONDS) > 0.000001:
            raise ValueError("Final audio track duration is not exactly 290 seconds")
        command([FFMPEG, "-v", "error", "-xerror", "-i", candidate, "-map", "0:a:0", "-vn",
                 "-c:a", "pcm_s16le", "-f", "null", "-"], run / "final-audio-decode.log")
        if digest(video) != source_hash:
            raise ValueError("Silent master changed during mux")
        report["video"] = {"source": str(video), "source_sha256": source_hash, "output": str(output),
                           "sha256": digest(candidate), "video_codec": out_video["codec_name"],
                           "video_copy": True, "frames": 8700, "fps": "30/1", "duration": SECONDS,
                           "audio_codec": "aac", "audio_bitrate": "256k", "sample_rate": RATE,
                           "channels": CHANNELS, "audio_decode_passed": True}
        write_json(run / "final-ffprobe.json", final)
        publish(candidate, output, args.overwrite)
    finally:
        candidate.unlink(missing_ok=True)


def parser():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--work-dir", type=Path)
    cli.add_argument("--voice-only", action="store_true", help="Fit and inspect all eight voices; skip effects and video mux")
    cli.add_argument("--max-speed", type=float, default=1.2, help="Maximum atempo (default 1.2, hard limit 1.3)")
    cli.add_argument("--head-margin", type=float, default=0.5)
    cli.add_argument("--tail-margin", type=float, default=0.6)
    cli.add_argument("--fx-below-voice-db", type=float, default=15)
    cli.add_argument("--background", type=Path)
    cli.add_argument("--background-license")
    cli.add_argument("--video", type=Path)
    cli.add_argument("--output", type=Path)
    cli.add_argument("--overwrite", action="store_true")
    return cli


def main():
    cli = parser()
    args = cli.parse_args()
    if args.work_dir is None:
        args.work_dir = Path(Path("/tmp/binance-7702-production-path.txt").read_text().strip())
    work = args.work_dir.resolve(strict=True)
    if not work.is_dir():
        cli.error("--work-dir must be an existing production directory")
    if not (1 <= args.max_speed <= 1.3) or not (0.3 <= args.head_margin <= 0.7) or not (0.4 <= args.tail_margin <= 0.8):
        cli.error("Require max-speed 1–1.3, head-margin 0.3–0.7, tail-margin 0.4–0.8")
    if not 12 <= args.fx_below_voice_db <= 18:
        cli.error("Effects must be 12–18dB below normalized narration")
    if bool(args.video) != bool(args.output):
        cli.error("--video and --output must be supplied together")
    if args.voice_only and args.video:
        cli.error("--voice-only does not mux video")
    if args.background and not args.background_license:
        cli.error("--background requires --background-license")
    if args.output and args.output.suffix.lower() != ".mp4":
        cli.error("--output must be an .mp4 file")
    if args.video and args.video.resolve() == args.output.resolve():
        cli.error("--output must not replace the silent input master")
    destinations = [work / "narration-timeline.wav"]
    if not args.voice_only:
        destinations.append(work / "mix-master.wav")
    if args.output:
        destinations.append(args.output.resolve())
    if args.background and args.background.resolve() in [file.resolve() for file in destinations]:
        cli.error("A generated output cannot also be the background input")
    for destination in destinations:
        if destination.exists() and not args.overwrite:
            cli.error(f"Output exists; use --overwrite deliberately: {destination}")
    run = Path(tempfile.mkdtemp(prefix="audio-run-", dir=work))
    report = {"status": "running", "work_dir": str(work), "run_dir": str(run),
              "started_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
              "tool_sha256": digest(Path(__file__)), "scenes": [], "outputs_published": [],
              "maximum_atempo": args.max_speed, "narration_target_lufs": -16,
              "effects_origin": "Only files supplied in fish/fx-* are used; no locally synthesized Fish stand-ins."}
    try:
        report["ffmpeg_version"] = command([FFMPEG, "-version"]).stdout.splitlines()[0]
        report["ffprobe_version"] = command([FFPROBE, "-version"]).stdout.splitlines()[0]
        voice = narration(work, run, args, report)
        master = None if args.voice_only else mix(work, run, voice, args, report)
        for row in report["scenes"]:
            if digest(Path(row["source"]["path"])) != row["source"]["sha256"]:
                raise ValueError("A source narration file changed during processing")
        for effect in report.get("effects", {}).get("sources", []):
            if digest(Path(effect["path"])) != effect["sha256"]:
                raise ValueError("A source Fish effect changed during processing")
        if digest(work / "narration.used.json") != report["narration_config"]["sha256"]:
            raise ValueError("Frozen narration text changed during processing")
        if args.video:
            mux(args.video.resolve(strict=True), master, args.output, run, args, report)
            report["outputs_published"].append(str(args.output.resolve()))
        publish(voice, work / "narration-timeline.wav", args.overwrite)
        report["outputs_published"].append(str(work / "narration-timeline.wav"))
        if master:
            publish(master, work / "mix-master.wav", args.overwrite)
            report["outputs_published"].append(str(work / "mix-master.wav"))
        report["status"] = "passed"
        report["completed_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        write_json(run / "report.json", report)
        write_json(work / "audio-mix-report.json", report)
        print(json.dumps({"status": report["status"], "report": str(work / "audio-mix-report.json"),
                          "run_dir": str(run), "outputs": report["outputs_published"]}, ensure_ascii=False))
        return 0
    except (Exception, KeyboardInterrupt) as error:
        report["status"] = "interrupted" if isinstance(error, KeyboardInterrupt) else ("needs-retake" if isinstance(error, NeedsRetake) else "failed")
        report["error"] = str(error)
        write_json(run / "report.json", report)
        write_json(work / "audio-mix-report.json", report)
        print(json.dumps({"status": report["status"], "error": str(error), "report": str(work / "audio-mix-report.json"),
                          "run_dir": str(run), "needs_retake": report.get("needs_retake"),
                          "missing_voice_files": report.get("missing_voice_files")}, ensure_ascii=False), file=sys.stderr)
        return 130 if isinstance(error, KeyboardInterrupt) else (2 if isinstance(error, NeedsRetake) else 1)


if __name__ == "__main__":
    sys.exit(main())
