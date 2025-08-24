// packages
import { useRef } from 'react';
import 'chartjs-adapter-date-fns';
import { Chart, TimeScale, LinearScale, PointElement, registerables } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { Chart as ReactChart } from 'react-chartjs-2';
// types
import { StockPoint } from '../types';

Chart.register(...registerables);
Chart.register(CandlestickController, CandlestickElement, PointElement, TimeScale, LinearScale);

interface StockChartProps {
	data: StockPoint[];
}

export const StockChart = ({ data }: StockChartProps) => {
	// refs
	const chartRef = useRef(null);

	return (
		<div className='relative m-auto w-full'>
			<ReactChart ref={chartRef} type='candlestick' data={{
				datasets: [
					{
						type: 'candlestick',
						label: 'Stock data',
						data: data.map((d) => ({ x: d.t, ...d })),
						backgroundColor: 'oklch(72.3% .219 149.579)', // legend color
						backgroundColors: {
							up: 'oklch(92.5% .084 155.995)',
							down: 'oklch(88.5% .062 18.334)',
							unchanged: 'oklch(92.8% .006 264.531)',
						},
						borderColors: {
							up: 'oklch(79.2% .209 151.711)',
							down: 'oklch(70.4% .191 22.216)',
							unchanged: 'oklch(70.7% .022 261.325)',
						},
						barPercentage: 0.9,
						categoryPercentage: 1.0,
					}, {
						type: 'line',
						label: 'Close price',
						data: data.map((d) => ({ x: d.t, y: d.c })),
						backgroundColor: 'oklch(63.7% .237 25.331)',
						borderColor: 'oklch(70.4% .191 22.216)',
						borderWidth: 1.5,
						pointRadius: 2,
						tension: 0.1
					}
				],
			}} options={{
				animation: false,
				maintainAspectRatio: false,
				responsive: true,
				interaction: { mode: 'index', intersect: false },
				scales: {
					x: {
						type: 'time',
						time: { unit: 'day', displayFormats: { day: 'MM-dd' }, tooltipFormat: `yyyy-MM-dd` },
						ticks: {
							callback: (val) => {
								const d = new Date(val as number);
								// force UTC format
								return `${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
							}
						},
						//adapters: { date: { locale: enUS } },
						grid: { display: false }
					},
					y: {
						type: 'linear',
						beginAtZero: false,
						ticks: {
							callback: function (value, index, ticks) {
								return '$' + Number(value).toFixed(2);
							}
						},
						grid: { display: false }
					},
				},
				plugins: {
					legend: {
						display: true,
					},
					tooltip: {
						callbacks: {
							title: (items) => {
								const d = new Date(items[0].parsed.x);
								return d.toISOString().slice(0, 10);
							},
							label: function (context) {
								const { raw, dataset } = context;
								if (dataset.type === 'candlestick' && raw) {
									return [
										`Open: $${raw.o.toFixed(2)}`,
										`High: $${raw.h.toFixed(2)}`,
										`Low: $${raw.l.toFixed(2)}`,
										//`Close: $${raw.c.toFixed(2)}`,
									];
								}
								if (dataset.type === 'line') {
									return `Close: $${context.parsed.y.toFixed(2)}`;
								}
							},
						}
					},
				}
			}} />
		</div>
	);
}