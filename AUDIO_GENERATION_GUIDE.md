# SoulSync Audio Generation Guide

## 🎯 Overview

This guide will help you generate high-quality, natural-sounding voice audio for the SoulSync meditation app using opensource Text-to-Speech (TTS) technology.

## 🌟 Why Natural Voices Matter

The current implementation uses `expo-speech`, which produces robotic-sounding voices that can disrupt the meditative experience. By generating audio files with natural neural TTS voices, we create a truly immersive, professional meditation experience.

## ✅ What's Included

We've created scripts to generate natural voice audio for all 5 QHHT meditation sessions:

1. **Soul Remembrance** - QHHT Induction (5 min)
2. **Quantum Field** - Divine Source Connection (5 min)
3. **Past Life Regression** - QHHT Protocol (5 min)
4. **Higher Self Communication** - Subconscious Access (5 min)
5. **Body Scanning & Theta Healing** - Energy Clearing (5 min)

## 🚀 Quick Start (Recommended Method)

### Prerequisites

- Python 3.8+
- Internet connection (for Edge TTS)
- ~15 minutes for generation

### Step 1: Install Dependencies

```bash
cd scripts
pip install -r requirements.txt
```

### Step 2: Generate Audio Files

```bash
python generate_audio.py
```

### Step 3: Verify Generated Files

```bash
ls -lh ../assets/audio/
```

You should see 5 new MP3 files, each around 2-8 MB.

## 🎵 Audio Generation Options

### Option 1: Edge TTS (Recommended)

**Pros:**
- ✅ Highest quality voices
- ✅ Natural, human-like speech
- ✅ Free, no API keys needed
- ✅ Multiple voices available
- ✅ Fast generation

**Cons:**
- ❌ Requires internet connection

**Setup:**
```bash
pip install edge-tts
python generate_audio.py
```

### Option 2: Piper TTS (Offline)

**Pros:**
- ✅ Fully offline after initial setup
- ✅ Fast generation
- ✅ Good quality
- ✅ Privacy-focused

**Cons:**
- ❌ Requires downloading voice models (~50-100MB)
- ❌ Fewer voice options

**Setup:**
```bash
pip install piper-tts
python generate_audio_offline.py
```

### Option 3: Alternative Services

If you prefer other TTS services, here are some options:

#### Google Cloud TTS
- Very high quality
- Requires API key and billing
- See: https://cloud.google.com/text-to-speech

#### Amazon Polly
- Neural voices available
- Requires AWS account
- See: https://aws.amazon.com/polly

#### OpenAI TTS
- Latest AI voices
- Requires API key
- See: https://platform.openai.com/docs/guides/text-to-speech

## 🎨 Customizing Voices

### Changing the Voice

Edit `generate_audio.py` and modify the `voice` parameter:

```python
{
    "voice": "en-US-AriaNeural",  # Change this
    "rate": "-35%",
    "pitch": "-5Hz",
}
```

### Available Voices

List all available Edge TTS voices:

```bash
python generate_audio.py --list-voices
```

**Recommended Female Voices:**
- `en-US-AriaNeural` - Warm, calming (current default)
- `en-US-JennyNeural` - Gentle, mystical
- `en-US-SaraNeural` - Soft, compassionate
- `en-GB-SoniaNeural` - British, elegant

**Recommended Male Voices:**
- `en-US-GuyNeural` - Professional, steady
- `en-GB-RyanNeural` - British, authoritative
- `en-AU-WilliamNeural` - Australian, warm

### Adjusting Speech Parameters

**Speech Rate** (how fast the voice speaks):
- `-40%` to `-30%`: Very slow (deep meditation)
- `-30%` to `-20%`: Slow (guided meditation) ← Current
- `-20%` to `-10%`: Moderately slow

**Pitch** (how high/low the voice sounds):
- `-10Hz` to `-5Hz`: Lower, more soothing ← Current
- `-5Hz` to `0Hz`: Slightly lower
- `0Hz` to `+5Hz`: Natural to slightly higher

Example:

```python
{
    "voice": "en-US-AriaNeural",
    "rate": "-40%",  # Extra slow for deep regression
    "pitch": "-8Hz",  # Very soothing, lower tone
}
```

## 🔧 Troubleshooting

### Error: "Cannot connect to host api.msedgeservices.com"

This means you don't have internet access. Solutions:

1. **Run on your local machine** (recommended):
   ```bash
   # Copy scripts to your computer
   cp -r scripts ~/audio-generation
   cd ~/audio-generation
   pip install -r requirements.txt
   python generate_audio.py

   # Copy generated files back
   cp *.mp3 /path/to/SoulSync/assets/audio/
   ```

2. **Use offline Piper TTS**:
   ```bash
   pip install piper-tts
   python generate_audio_offline.py
   ```

### Error: "piper command not found"

Install Piper TTS:
```bash
pip install piper-tts
```

Or download the binary from:
https://github.com/rhasspy/piper/releases

### Generated Files are Too Large

By default, audio is generated at 24kHz. To reduce file size:

```bash
# Install ffmpeg
sudo apt install ffmpeg

# Convert to lower bitrate
ffmpeg -i input.mp3 -ar 22050 -ab 96k output.mp3
```

### Audio Quality is Poor

Try these solutions:

1. **Use a different voice**:
   ```bash
   python generate_audio.py --list-voices
   ```

2. **Adjust speech rate** (slower = more natural):
   ```python
   "rate": "-40%"  # Try even slower
   ```

3. **Try premium services** (requires API keys):
   - Google Cloud TTS
   - Amazon Polly
   - OpenAI TTS

## 📱 Using Generated Audio in the App

The app is already configured to use the generated MP3 files. Simply:

1. Generate audio files using the scripts
2. Files are automatically saved to `assets/audio/`
3. The app will use these files instead of TTS

No code changes needed!

## 🎭 Voice Acting Tips

For even better results, consider these professional tips:

### Script Modifications

The scripts use special formatting for meditation:

- **Ellipses (...)**: Natural pauses
- **Period (.)**: Sentence breaks
- **Comma (,)**: Brief pauses

Example:
```
"Close your eyes... and breathe deeply."
```

### Adding Background Music

To layer audio with background music:

```bash
# Install ffmpeg
sudo apt install ffmpeg

# Mix voice with background music
ffmpeg -i voice.mp3 -i background.mp3 -filter_complex \
  "[1:a]volume=0.3[bg];[0:a][bg]amix=inputs=2:duration=shortest" \
  output.mp3
```

## 🚢 Production Checklist

Before deploying:

- [ ] All 5 meditation audio files generated
- [ ] Each file is 2-8 MB in size
- [ ] Audio quality sounds natural and soothing
- [ ] Speech rate is slow enough for meditation
- [ ] No robotic or distorted audio
- [ ] Files are properly named (match AudioService.ts)
- [ ] Test playback in the app

## 📚 Additional Resources

- **Edge TTS Documentation**: https://github.com/rn0x/edge-tts
- **Piper TTS**: https://github.com/rhasspy/piper
- **QHHT (Quantum Healing)**: https://www.dolorescannon.com
- **Meditation Audio Best Practices**: https://example.com/meditation-audio

## 💡 Future Enhancements

Potential improvements:

1. **Multiple voice options** - Let users choose their preferred voice
2. **Binaural beats** - Add frequency entrainment
3. **Background soundscapes** - Layer with nature sounds
4. **Dynamic pacing** - Adjust speed based on meditation phase
5. **Multilingual support** - Generate in multiple languages

## 🤝 Contributing

To add new meditation scripts:

1. Add script text to `MeditationScriptService.ts`
2. Add corresponding entry to `generate_audio.py`
3. Run generation script
4. Test in the app
5. Submit PR

## 📝 License

These scripts use opensource TTS technology:
- Edge TTS: Free for personal and commercial use
- Piper TTS: MIT License

## ✨ Credits

- **Meditation Scripts**: Based on QHHT methodology by Dolores Cannon
- **TTS Technology**: Microsoft Edge Neural TTS, Piper TTS
- **SoulSync App**: Spiritual meditation and consciousness exploration
