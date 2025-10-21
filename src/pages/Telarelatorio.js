import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import SummaryCards from '../components/SummaryCards';
import MonthSelector from '../components/MonthSelector';
import { getTransactions, getCategoriesMock } from '../services/mockApi';

const CategoryLegend = ({ data, totalDespesasMes }) => {
    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="relatorio-category-legend">
            <h3>Despesas por categorias</h3>
            {data.map((item) => (
                <div key={item.name} className="relatorio-legend-item">
                    <div className="relatorio-legend-icon-and-name">
                        <span style={{ backgroundColor: item.color }} className="relatorio-legend-icon"></span>
                        <div style={{ lineHeight: '1.2' }}>
                            <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                            <br />
                            <small>Porcentagem</small>
                        </div>
                    </div>
                    <div className="relatorio-legend-values">
                        <span className="value">{formatCurrency(item.value)}</span>
                        <span className="percentage" style={{ color: item.color, fontWeight: 'bold' }}>
                            {/* Cálculo da porcentagem para a legenda */}
                            {((item.value / totalDespesasMes) * 100).toFixed(2).replace('.', ',')}%
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const TelaRelatorio = () => {
    const navigate = useNavigate();
    
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState('Setembro 2025');
    const currentPage = 'relatorio';

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const getCurrentDate = useMemo(() => {
        const [monthName, yearStr] = currentMonth.split(' ');
        const monthIndex = monthNames.findIndex(name => name === monthName);
        const year = parseInt(yearStr);
        return new Date(year, monthIndex, 1); 
    }, [currentMonth]);
    
    const handleMonthChange = (direction) => {
        const currentDate = getCurrentDate;
        let newDate;
        
        if (direction === 'next') {
            newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        } else if (direction === 'previous') {
            newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        } else {
            return;
        }

        const newMonthName = monthNames[newDate.getMonth()];
        const newYear = newDate.getFullYear();
        
        setCurrentMonth(`${newMonthName} ${newYear}`);
    };
    
    const handleNavigate = (key) => {
        switch (key) {
            case 'dashboard': navigate('/dashboard'); break;
            case 'transacoes': navigate('/'); break;
            case 'categorias-list': navigate('/categorias'); break;
            default: break;
        }
    };
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const [transData, catData] = await Promise.all([getTransactions(), getCategoriesMock()]);
            setTransactions(transData);
            setCategories(catData);
        } catch (err) {
            console.error("Falha ao carregar dados:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const getMonthAndYear = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        const month = date.toLocaleString('pt-BR', { month: 'long' });
        const year = date.getFullYear();
        return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
    };

    const transactionsInCurrentMonth = useMemo(() => {
        const currentMonthYear = currentMonth.toLowerCase();
        return transactions.filter(t => 
            t.date && getMonthAndYear(t.date).toLowerCase() === currentMonthYear.toLowerCase()
        );
    }, [transactions, currentMonth]);

    const { totalReceitasGeral, totalDespesasGeral, saldoAtualGeral } = useMemo(() => {
        const totalR = transactions.filter(t => t.valor > 0).reduce((sum, t) => sum + t.valor, 0);
        const totalD = transactions.filter(t => t.valor < 0).reduce((sum, t) => sum + Math.abs(t.valor), 0);
        const saldo = totalR - totalD;
        
        return { 
            totalReceitasGeral: totalR, 
            totalDespesasGeral: totalD, 
            saldoAtualGeral: saldo 
        };
    }, [transactions]);


    
    const chartData = useMemo(() => {
        const despesasDoMes = transactionsInCurrentMonth.filter(t => t.valor < 0);
        const totalDespesasMes = despesasDoMes.reduce((sum, t) => sum + Math.abs(t.valor), 0);

        if (totalDespesasMes === 0) return { data: [], total: 0 };

        
        const categoryTotals = despesasDoMes.reduce((acc, transaction) => {
            const categoryName = transaction.category || 'Outros'; 
            const value = Math.abs(transaction.valor);
            acc[categoryName] = (acc[categoryName] || 0) + value;
            return acc;
        }, {});

       
        let formattedData = Object.keys(categoryTotals).map(name => {
            const value = categoryTotals[name];
            const percentage = Math.round((value / totalDespesasMes) * 100);
            const categoryDetails = categories.find(c => c.name === name);
            
            
            let color = categoryDetails ? categoryDetails.color : '#42a5f5'; 

            return {
                name,
                value, 
                percentage,
                color,
            };
        });

        formattedData.sort((a, b) => b.percentage - a.percentage);
        
        return {
            data: formattedData,
            total: totalDespesasMes
        };
    }, [transactionsInCurrentMonth, categories]); 

    if (loading) return <div className="loading-spinner">Carregando relatórios...</div>;
    
    const { data: reportData, total: totalDespesasMes } = chartData;

    // --- RENDERIZAÇÃO ---
    return (
        <div className="page-layout">
            <Sidebar
                activePage={currentPage}
                onNavigate={handleNavigate}
                onNewTransaction={() => navigate('/')} 
            />
            
            <div className="main-content-area">
                <h1 className="relatorio-title">Relatórios</h1> 
                
                {/* 1. Cartões Superiores */}
                <SummaryCards
                    saldoAtual={saldoAtualGeral}
                    receitas={totalReceitasGeral} 
                    despesas={totalDespesasGeral} 
                />
                
                {/* 2. Área Principal do Relatório */}
                <div className="relatorio-main-card">
                    
                    {/* Seletor de Mês (AGORA DINÂMICO) */}
                    <MonthSelector
                        currentMonth={currentMonth}
                        onPrevious={() => handleMonthChange('previous')} 
                        onNext={() => handleMonthChange('next')} 
                        isReportContext={true}
                    />

                    <div className="relatorio-content-flex">
                        
                        {/* Gráfico de Barras (Recharts) */}
                        <div className="relatorio-chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={reportData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" hide /> 
                                    <YAxis hide /> 
                                    <Tooltip 
                                        formatter={(value, name, props) => [
                                            value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 
                                            props.payload.name
                                        ]}
                                    />

                                    {reportData.map((entry, index) => (
                                        <Bar 
                                            key={`bar-${index}`}
                                            dataKey="value" 
                                            fill={entry.color} 
                                            maxBarSize={60} 
                                            label={{ 
                                                position: 'top', 
                                                formatter: () => `${entry.percentage}%`,
                                                fill: '#333',
                                                fontSize: 14
                                            }}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Lista de Despesas por Categoria (Legenda) */}
                        <CategoryLegend data={reportData} totalDespesasMes={totalDespesasMes} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TelaRelatorio;