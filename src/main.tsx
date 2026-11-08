import ReactDOM from 'react-dom/client';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

if (
  ['/components', '/ui-reference', '/ui-reference/', '/ui-reference/colors', '/ui-reference/colors/'].includes(
    window.location.pathname
  )
) {
  import('./ComponentsShowcaseApp').then(({ ComponentsShowcaseApp }) => {
    root.render(
      <ComponentsShowcaseApp
        buttonReference={window.location.pathname.startsWith('/ui-reference')}
        colorReference={window.location.pathname.startsWith('/ui-reference/colors')}
      />
    );
  });
} else {
  import('./App').then(({ App }) => {
    root.render(<App />);
  });
}
