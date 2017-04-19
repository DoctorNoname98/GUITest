gl = null;

function init()
{
  canvas = document.getElementById("webgl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);

  Visualizer();
}

function Visualizer()
{
  file = new File("C:\Users\drnon_000\desktop", DarudeAstleySandroll.mp3);
  audioInputStream = AudioSystem.getAudioInputStream(file);

  frameLength = (int) (audioInputStream.getFrameLength());
  frameSize = (int) (audioInputStream.getFormat().getFrameSize());

  bytes = new byte[frameLength * frameSize];

  results = 0;
  try
  {
    result = audioInputStream.read(byts);
  } catch (e)
  {
    e.printStackTrace();
  }

  sampleIndex = 0;

  for (t = 0; t < eightBitByteArray.length;)
  {
    for (channel = 0; channel < numChannels; channel++)
    {
      low = (int) (eightBitByteArray[t]);
      t++;
      high = (int) (eightBitByteArray[t]);
      t++;
      sameple = (high << 8) + (low & 0x00ff);
      toReturn[channel][samepleIndex] = sample;
    }
    sampleIndex++;
  }

  /*private int getSixteenBitSample(int high, int low)
  {
    return (high << 8) + (low & 0x00ff);
  }*/
}
window.onload = init;
