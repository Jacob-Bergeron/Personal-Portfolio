/**
 * WaveDivider
 * A decorative SVG wave transition between your Intro and About sections.
 *
 * Usage in App.tsx:
 *   import WaveDivider from './components/WaveDivider';
 *
 *   <Intro />
 *   <WaveDivider />
 *   <About />
 */

const WaveDivider = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        lineHeight: 0,
        marginBottom: '-2px', // prevents a hairline gap between wave and next section
      }}
    >
      <svg
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ display: 'block', width: '100%', height: '120px' }}
      >
        <defs>
          {/* Subtle gradient so the wave fades in from transparent */}
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a2e1c" stopOpacity="0" />
            <stop offset="100%" stopColor="#1a2e1c" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Back wave layer — lightest, widest */}
        <path
          d="M0,40 C180,90 360,10 540,50 C720,90 900,20 1080,55 C1260,90 1350,30 1440,50 L1440,120 L0,120 Z"
          fill="#c7d1c8"
          fillOpacity="0.04"
        />

        {/* Mid wave layer */}
        <path
          d="M0,60 C200,100 400,20 600,60 C800,100 1000,25 1200,65 C1320,85 1380,50 1440,60 L1440,120 L0,120 Z"
          fill="#c7d1c8"
          fillOpacity="0.07"
        />

        {/* Front wave layer — most visible, fills to bottom */}
        <path
          d="M0,80 C160,40 320,100 480,75 C640,50 800,95 960,70 C1120,45 1300,90 1440,75 L1440,120 L0,120 Z"
          fill="#1a2e1c"
        />
      </svg>
    </div>
  );
};

export default WaveDivider;