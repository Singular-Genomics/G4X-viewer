import ReactDOM from 'react-dom/client';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

if (window.location.pathname === '/components') {
  import('./ComponentsShowcaseApp').then(({ ComponentsShowcaseApp }) => {
    root.render(<ComponentsShowcaseApp />);
  });
} else {
  import('./App').then(({ App }) => {
    root.render(<App />);
  });
}
