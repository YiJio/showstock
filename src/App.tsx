// packages
import { useEffect, useState } from 'react';
import Papa from 'papaparse';
// components
import { Dialog, Search, StockCard, StockTable } from './components';

function App() {
	// states
	const [symbols, setSymbols] = useState<any[]>([]);
	const [selectedStock, setSelectedStock] = useState<string | null>('AAPL');
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	useEffect(() => {
		const fetchSymbols = async () => {
			Papa.parse('/assets/symbols.csv', {
				download: true, header: true,
				complete: (res) => {
					setSymbols(res.data);
				}
			});
		};
		fetchSymbols();
	}, []);

	return (
		<div className='relative'>
			<div className='flex flex-col gap-4 w-full lg:w-5xl xl:w-6xl md:m-auto min-h-screen p-4 bg-white dark:bg-gray-950 transition-all'>
				<h1 className='text-4xl font-bold'>Stock Dashboard</h1>
				<Search onClick={setSelectedStock} symbols={symbols} />
				<div className='w-full flex gap-4 flex-col md:flex-row'>
					<StockCard ticker={selectedStock} symbols={symbols} setDialogOpen={setIsDialogOpen} />
					<StockTable onClick={setSelectedStock} />
				</div>
			</div>
			{isDialogOpen && (<Dialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />)}
		</div>
	);
}

export default App;