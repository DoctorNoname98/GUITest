File file = new File("\Users\drnon_000\desktop", DarudeAstleySandroll.mp3);
AudioInputStream audioInputStream = AudioSystem.getAudioInputStream(file);

int frameLength = (int) audioInputStream.getFrameLength();
int frameSize = (int) audioInputStream.getFormat().getFrameSize();

byte[] bytes = new byte[frameLength * frameSize];

int results = 0;
try
{
  result = audioInputStream.read(byts);
} catch (Exception e)
{
  e.printStackTrace();
}

int sampleIndex = 0;

for (int t = 0; t < eightBitByteArray.length;)
{
  for (int channel = 0; channel < numChannels; channel++)
  {
    int low = (int) eightBitByteArray[t];
    t++;
    int high = (int) eightBitByteArray[t];
    t++;
    int samepl = getSixteenBitSample(high, low);
    toReturn[channel][samepleIndex] = sample;
  }
  sampleIndex++;
}

private int getSixteenBitSample(int high, int low)
{
  return (high << 8) + (low & 0x00ff);
}
