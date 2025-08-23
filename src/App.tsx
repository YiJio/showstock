// packages
import { useState } from 'react';
import StockDashboard from './stock';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <StockDashboard />
    </>
  );
}

export default App
