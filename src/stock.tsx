// packages
import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

//const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function StockDashboard() {
	const [symbols, setSymbols] = useState<any[]>([]);
	const [quotes, setQuotes] = useState<any[]>([]);
	const [search, setSearch] = useState('');
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [selectedStock, setSelectedStock] = useState<any>(null);
	const [chartData, setChartData] = useState<any>(null);

	const handleSelectStock = async (stock: any) => {
		setSearch('');
		setSearchResults([]);
		//const q = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`).then((r) => r.json());
		const q = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.symbol}&apikey=demo`).then((r) => r.json());
		const g = q['Global Quote'];
		const stockData = { symbol: g['01. symbol'], name: stock.name, price: g['05. price'], priceChange: g['09. change'], percentChange: g['10. change percent'] };
		setSelectedStock(stockData);
	}

	const handleCandles = async () => {
		const now = Math.floor(Date.now() / 1000);
		const from = now - 60 * 60 * 24 * 30;
		//const candles = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${selectedStock.symbol}&resolution=D&from=${from}&to=${now}&token=${API_KEY}`).then((r) => r.json());
		const candles = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${selectedStock.symbol}&interval=30min&apikey=demo`).then((r) => r.json());
		const series = candles['Time Series (30min)'];
		if (series) {
			const labels = Object.keys(series).reverse();
			const data = labels.map((t) => parseFloat(series[t]['4. close']));
			setChartData({
				labels, datasets: [{
					label: `${selectedStock.symbol} Price`,
					data,
					borderColor: 'blue',
					backgroundColor: 'rgba(0,0,255,0.1)',
				}]
			});
		}
		/*if (candles.s === 'ok') {
			setChartData({
				labels: candles.t.map((t: number) => new Date(t * 1000).toLocaleDateString()),
				datasets: [{
					label: `${selectedStock.symbol} Price`,
					data: candles.c,
					borderColor: 'blue',
					backgroundColor: 'rgba(0,0,255,0.1)'
				}],
			});
		}*/
	}

	useEffect(() => {
		const fetchSymbols = async () => {
			try {
				// get symbol list once and cache
				//const symbolRes = await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${API_KEY}`);
				//const symbols = await symbolRes.json();
				const res = await fetch(`/assets/listing_status.csv`);
				const text = await res.text();
				const parsed = Papa.parse(text, { header: true });
				console.log('symbols fetch', parsed.data)
				setSymbols(parsed.data);
			} catch (error) {
				console.error(error);
			}
		};
		fetchSymbols();
	}, []);

	useEffect(() => {
		const fetchQuotes = async () => {
			try {
				// get only first 10 quotes from the symbols to always be on display
				const first = symbols.slice(0, 10);
				const data = await Promise.all(
					first.map(async (s, i) => {
						//const q = await fetch(`https://finnhub.io/api/v1/quote?symbol=${s.symbol}&token=${API_KEY}`).then((r) => r.json());
						const q = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${s.symbol}&apikey=demo`).then((r) => r.json());
						console.log(q)
						const g = q['Global Quote'];
						//const stockData = { symbol: s.symbol, name: s.description, price: q.c, priceChange: q.d ? q.d.toFixed(2) : 0, percentChange: q.dp ? q.dp.toFixed(2) : 0, };
						const stockData = { symbol: g['01. symbol'], name: s.name, price: g['05. price'], priceChange: g['09. change'], percentChange: g['10. change percent'] };
						if (i === 0) { handleSelectStock(s); }
						return stockData;
					})
				);
				setQuotes(data);
			} catch (error) {
				console.error(error);
			}
		}
		if (symbols.length > 0) fetchQuotes();
	}, [symbols]);

	useEffect(() => {
		if (search.length > 0) {
			const results = symbols.filter((s) => {
				//console.log(s)
				const symbolMatch = s.symbol?.toLowerCase().includes(search.toLowerCase());
				const descMatch = s.name?.toLowerCase().includes(search.toLowerCase());
				return symbolMatch || descMatch;
			}).slice(0, 5);
			console.log('search',results);
			setSearchResults(results);
		} else {
			setSearchResults([]);
		}
	}, [search, symbols]);

	useEffect(() => {
		if(selectedStock) handleCandles();
	}, [selectedStock]);

	const getHighlightedText = (text: string, highlight: string) => {
		const regex = new RegExp(`(${highlight})`, 'gi');
		return text.split(regex).map((part, index) => part.toLowerCase() === highlight.toLowerCase() ? (<span key={index} className='bg-amber-300'>{part}</span>) : (part));
	}

	return (
		<div className='w-full'>
			<input type='text' className='border p-2 w-full' value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search symbol or company name...' />
			{searchResults.length > 0 && (<div className='border bg-white shadow mt-1 rounded max-h-40 overflow-y-auto'>
				{searchResults.map((s) => (<div key={s.symbol} className='p-2 hover:bg-gray-100 cursor-pointer' onClick={() => handleSelectStock(s)}>
					{getHighlightedText(s.symbol, search)} / {getHighlightedText(s.name, search)}
				</div>))}
			</div>)}
			<div className='flex p-6 gap-6'>
				<div className='w-1/2 border rounded-lg p-4 shadow'>
					<h2 className='text-xl font-semibold mb-2'>{selectedStock?.symbol}</h2>
					<p>{selectedStock?.name}</p>
					<p>
						<span>${selectedStock?.price}</span> /
						<span className={`ml-2 ${selectedStock?.change > 0 ? 'text-green-600' : 'text-red-600'}`}>{selectedStock?.percentChange}%</span>
					</p>
					{chartData && (<div className='mt-4'>
						<Line data={chartData} />
					</div>)}
				</div>
				<div className='w-1/2 border rounded-lg p-4 shadow'>
					<h2 className='text-xl font-semibold mb-2'>Stocks</h2>
					<table className='table-auto border-collapse border w-full'>
						<thead>
							<tr>
								<th className='border px-2 py-1'>Symbol</th>
								<th className='border px-2 py-1'>Name</th>
								<th className='border px-2 py-1'>Price ($)</th>
								<th className='border px-2 py-1'>Change ($)</th>
								<th className='border px-2 py-1'>Change (%)</th>
							</tr>
						</thead>
						<tbody>
							{quotes.map((q) => (<tr key={q.symbol}>
								<td className='border px-2 py-1'>{q.symbol}</td>
								<td className='border px-2 py-1'>{q.name}</td>
								<td className='border px-2 py-1'>${q.price}</td>
								<td className='border px-2 py-1'>${q.priceChange}</td>
								<td className={`border px-2 py-1 ${q.percentChange > 0 ? 'text-green-600' : 'text-red-600'}`}>{q.percentChange}%</td>
							</tr>))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}