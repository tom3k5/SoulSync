#!/usr/bin/env python3
"""
Generate natural voice audio files using Piper TTS (fully offline).

Piper is a fast, local neural text-to-speech system that works completely offline
and produces high-quality, natural voices perfect for meditation guidance.

Installation:
    pip install piper-tts

Download voices from: https://github.com/rhasspy/piper/releases/
Or let the script download them automatically.

Usage:
    python scripts/generate_audio_offline.py
"""

import subprocess
import sys
from pathlib import Path
import json
import urllib.request
import tarfile

# Output directory for generated audio files
OUTPUT_DIR = Path(__file__).parent.parent / "assets" / "audio"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Piper voices directory
PIPER_DIR = Path(__file__).parent / "piper_voices"
PIPER_DIR.mkdir(parents=True, exist_ok=True)

# Voice model to use (high quality female voice)
VOICE_MODEL = "en_US-lessac-medium"
VOICE_URL = f"https://github.com/rhasspy/piper/releases/download/v1.2.0/{VOICE_MODEL}.onnx"
VOICE_CONFIG_URL = f"https://github.com/rhasspy/piper/releases/download/v1.2.0/{VOICE_MODEL}.onnx.json"

# Meditation scripts
MEDITATION_SCRIPTS = [
    {
        "id": "script_qhht_induction",
        "filename": "soul_remembrance.mp3",
        "script": """Welcome, beautiful soul. Find a comfortable position where you won't be disturbed.
Close your eyes gently. and take a deep breath in through your nose.
Hold it for a moment. and slowly release through your mouth.

As Dolores Cannon taught us, you are an eternal soul having a temporary human experience.
Your consciousness is infinite. Your essence is timeless.

Let's begin the countdown induction that will guide you to the theta state.
where you can access your deepest wisdom and soul memories.

Number 10. Feel your body beginning to relax. Release any tension in your shoulders.
Number 9. Your breathing becomes slow and natural. You are safe. You are loved.
Number 8. Sinking deeper now. deeper into peace. deeper into your true self.
Number 7. Your mind is quiet. Your body is at ease. You are moving beyond the physical.
Number 6. Halfway there. Feel yourself floating. weightless. free.
Number 5. Deeper still. Accessing the quantum field where all possibilities exist.
Number 4. Your higher self is present. You are never alone. You are always guided.
Number 3. Almost there. The veil between worlds grows thin. You remember who you truly are.
Number 2. So close now. You feel the infinite love of source energy surrounding you.
Number 1. You have arrived. You are in the sacred space of soul remembrance.

You are now connected to your Higher Self. that aspect of you that knows everything.
sees everything. and loves you unconditionally.

In this space, you remember your eternal nature. You are not just this body.
You are not just this lifetime. You are a magnificent soul on an infinite journey.

You have lived many lives. You will live many more.
Each experience adds to the richness of your soul's evolution.

Right now, in this moment, feel the truth of your eternal existence.
You chose to be here. You chose this life. You chose these challenges as opportunities for growth.

Your soul is ancient and wise. It remembers everything.
And it has brought you to this very moment for a reason.

Take a few moments now in silence. to receive any messages.
any insights. any healing your soul wishes to share with you.

Pause for reflection.

When you're ready, know that you can return to this sacred space anytime.
Your higher self is always available. You simply need to ask.

Now, let's begin the journey back. Bringing all this wisdom with you.
Counting from 1 to 5, returning to the present moment.

1. Beginning to return. Feeling the weight of your body.
2. Energy flowing back into your limbs. You remember where you are.
3. Taking a deep breath. Wiggling your fingers and toes.
4. Almost back now. Feeling refreshed, renewed, and deeply connected.
5. Eyes open. Welcome back, eternal soul. You are forever changed by this experience."""
    },
    # Add other scripts as needed
]


def check_piper_installed():
    """Check if piper is installed."""
    try:
        result = subprocess.run(["piper", "--version"],
                              capture_output=True, text=True)
        return True
    except FileNotFoundError:
        return False


def install_piper():
    """Provide instructions to install piper."""
    print("""
    ╔══════════════════════════════════════════════════════════════════╗
    ║                    Piper TTS Not Found                           ║
    ╚══════════════════════════════════════════════════════════════════╝

    Please install Piper TTS:

    Option 1 - Using pip:
        pip install piper-tts

    Option 2 - Download binary:
        Visit: https://github.com/rhasspy/piper/releases
        Download the appropriate binary for your system

    Option 3 - Using conda:
        conda install -c conda-forge piper-tts
    """)
    sys.exit(1)


def download_voice_model():
    """Download the voice model if not present."""
    model_path = PIPER_DIR / f"{VOICE_MODEL}.onnx"
    config_path = PIPER_DIR / f"{VOICE_MODEL}.onnx.json"

    if model_path.exists() and config_path.exists():
        print(f"✓ Voice model already downloaded: {VOICE_MODEL}")
        return model_path

    print(f"\nDownloading voice model: {VOICE_MODEL}")
    print("This may take a few minutes...")

    try:
        print(f"  Downloading {VOICE_URL}")
        urllib.request.urlretrieve(VOICE_URL, model_path)
        print(f"  ✓ Downloaded model file")

        print(f"  Downloading {VOICE_CONFIG_URL}")
        urllib.request.urlretrieve(VOICE_CONFIG_URL, config_path)
        print(f"  ✓ Downloaded config file")

        return model_path
    except Exception as e:
        print(f"  ✗ Error downloading voice model: {e}")
        print("\n  Please download manually from:")
        print(f"    {VOICE_URL}")
        print(f"    {VOICE_CONFIG_URL}")
        print(f"  And place in: {PIPER_DIR}")
        sys.exit(1)


def generate_audio_piper(script_data, model_path):
    """Generate audio using Piper TTS."""
    output_path = OUTPUT_DIR / script_data["filename"]

    print(f"\n{'='*60}")
    print(f"Generating: {script_data['filename']}")
    print(f"Voice: {VOICE_MODEL}")
    print(f"{'='*60}")

    try:
        # Create temporary text file
        text_file = PIPER_DIR / "temp_script.txt"
        text_file.write_text(script_data["script"])

        # Generate audio using piper
        # --length_scale > 1.0 slows down speech (1.5 = 50% slower)
        subprocess.run([
            "piper",
            "--model", str(model_path),
            "--output_file", str(output_path),
            "--length_scale", "1.5",  # Slower for meditation
            "--sentence_silence", "0.5"  # Pauses between sentences
        ], stdin=open(text_file), check=True)

        # Get file size
        file_size_mb = output_path.stat().st_size / (1024 * 1024)
        print(f"✓ Generated: {output_path}")
        print(f"  File size: {file_size_mb:.2f} MB")

        # Clean up
        text_file.unlink()

    except subprocess.CalledProcessError as e:
        print(f"✗ Error generating {script_data['filename']}: {e}")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")


def main():
    """Main function."""
    print("""
╔══════════════════════════════════════════════════════════════════╗
║         SoulSync Meditation Audio Generator (Offline)            ║
║         Using Piper Neural TTS                                   ║
╚══════════════════════════════════════════════════════════════════╝
    """)

    # Check if piper is installed
    if not check_piper_installed():
        install_piper()

    # Download voice model if needed
    model_path = download_voice_model()

    print(f"\nOutput directory: {OUTPUT_DIR}")
    print(f"Number of scripts to generate: {len(MEDITATION_SCRIPTS)}\n")

    # Generate each audio file
    for script_data in MEDITATION_SCRIPTS:
        generate_audio_piper(script_data, model_path)

    print("\n" + "="*60)
    print("✓ Audio generation complete!")
    print("="*60)

    # List all generated files
    print("\nGenerated files:")
    for file in sorted(OUTPUT_DIR.glob("*.mp3")):
        if file.name in [s["filename"] for s in MEDITATION_SCRIPTS]:
            size_mb = file.stat().st_size / (1024 * 1024)
            print(f"  • {file.name} ({size_mb:.2f} MB)")


if __name__ == "__main__":
    main()
