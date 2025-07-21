import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Button } from "../src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../src/components/ui/card"
import { Input } from "../src/components/ui/input"
import { Label } from "../src/components/ui/label"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../src/components/ui/table"

function Home() {
  const [web3, setWeb3] = useState(null);
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState([
    { description: 'SEI/USDC on DEX A vs DEX B', profit: 2.5 },
    { description: 'ATOM/SEI on DEX C vs DEX D', profit: 1.8 },
    { description: 'USDT/SEI on DEX E vs DEX F', profit: 3.1 }
  ]);
  const [performanceMetrics, setPerformanceMetrics] = useState({ trades: 150, successRate: 92 });

  useEffect(() => {
    const initWeb3 = async () => {
      const provider = new Web3.providers.HttpProvider('http://localhost:8545');
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);
      // Placeholder untuk fetch data arbitrase dan performa
    };
    initWeb3();
  }, []);

  return (
    <div className="bg-black text-neon-green font-mono min-h-screen p-8 bg-gradient-to-br from-black to-purple-900 animate-glitch">
      <header className="text-4xl font-bold mb-8 text-neon-pink glow">Flash-Swap Yield Arb Agent Dashboard</header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-glow-neon border border-neon-blue">
          <CardHeader>
            <CardTitle className="text-2xl text-neon-blue">Arbitrage Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Potential Profit (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arbitrageOpportunities.map((opp, index) => (
                  <TableRow key={index}>
                    <TableCell>{opp.description}</TableCell>
                    <TableCell>{opp.profit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="shadow-glow-neon border border-neon-pink">
          <CardHeader>
            <CardTitle className="text-2xl text-neon-pink">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neon-green">Total Trades: {performanceMetrics.trades}</p>
            <p className="text-neon-green">Success Rate: {performanceMetrics.successRate}%</p>
          </CardContent>
        </Card>
        <Card className="shadow-glow-neon border border-neon-green">
          <CardHeader>
            <CardTitle className="text-2xl text-neon-green">Agent Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 mb-4">
              <Label htmlFor="threshold">Min Profit Threshold (%)</Label>
              <Input id="threshold" type="number" placeholder="Enter minimum profit" />
            </div>
            <Button variant="default" className="mr-4">Start Agent</Button>
            <Button variant="destructive">Stop Agent</Button>
            <Button variant="outline" className="ml-4">Apply Threshold</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Home;