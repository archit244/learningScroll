import Lever from './Lever';
import SystemToggle from './SystemToggle';

const SimulatorWrapper = ({ data }) => {
  if (!data) return null;

  switch (data.template) {
    case 'Lever':
      return <Lever config={data.config} />;
    case 'SystemToggle':
      return <SystemToggle config={data.config} />;
    default:
      return <div className="text-gray-400 italic">Interactive element coming soon...</div>;
  }
};

export default SimulatorWrapper;