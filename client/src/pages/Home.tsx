import { useEffect } from 'react';

const Home = () => {
  useEffect(() => {
    // Load the eye-gaze keyboard directly in an iframe for seamless integration
    const loadKeyboard = () => {
      const iframe = document.getElementById('keyboard-iframe') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = '/index.html';
      }
    };
    
    loadKeyboard();
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe 
        id="keyboard-iframe"
        title="Eye-Gaze Keyboard"
        style={{ 
          width: '100%', 
          height: '100%', 
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      />
    </div>
  );
};

export default Home;