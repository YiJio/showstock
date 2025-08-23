// packages
import { useEffect, useState } from 'react';
import Papa from 'papaparse';
// components
import { Search, StockCard, StockTable } from './components';

function App() {
  // states
  const [symbols, setSymbols] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<string | null>('AAPL');

  useEffect(() => {
    const fetchSymbols = async () => {
      Papa.parse('/assets/listing_status.csv', {
        download: true, header: true,
        complete: (res) => {
          setSymbols(res.data);
        }
      });
    };
    fetchSymbols();
  }, []);

  return (
    <div className='relative flex flex-col gap-4 w-full lg:w-5xl xl:w-6xl md:m-auto min-h-screen p-4 bg-white dark:bg-gray-950 transition-all'>
      <h1 className='text-4xl font-bold'>Stock Dashboard</h1>
      <Search onClick={setSelectedStock} symbols={symbols} />
      <div className='w-full flex gap-4 flex-col md:flex-row'>
        <StockCard ticker={selectedStock} symbols={symbols} />
        <StockTable onClick={setSelectedStock} />
      </div>
    </div>
  );
}

export default App;