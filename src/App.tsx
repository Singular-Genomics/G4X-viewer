import AvivatorTs from './components/AvivatorTs'
import { ViewerSourceType } from './stores/ViewerStore'
import { demoSources } from './demo-data/demoSources'

const resolveSource = (sourceQueryParam: string ): ViewerSourceType => {
  if(sourceQueryParam) {
    return ({
      urlOrFile: sourceQueryParam,
      description: sourceQueryParam.split('?')[0].split('/').slice(-1)[0],
    });
  }

  return ({
    ...demoSources[6],
    isDemoImage: true,    
  });
}

export const App = () => {
  const query = new URLSearchParams(window.location.search);
  const source = resolveSource(query.get('image_url') ?? '');

  return <AvivatorTs initSource={source}/>
}