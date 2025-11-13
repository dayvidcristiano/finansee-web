import React, { useEffect, useState, useMemo, useCallback } from 'react'; // 1. Adiciona useCallback
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FaArrowUp, FaArrowDown, FaUniversity } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

import { getDashboardData, getCategories } from '../services/apiService';
import Telacriacaodesp from './Telacriacaodesp'; 
import Telacriacaoreceita from './Telacriacaoreceita';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Teladashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 3. ESTADOS SIMPLIFICADOS
  const [categories, setCategories] = useState([]); // Para os modais
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [receitas, setReceitas] = useState(0);
  const [despesas, setDespesas] = useState(0);
  const [despesasChartData, setDespesasChartData] = useState({ labels: [], datasets: [] });
  const [receitasChartData, setReceitasChartData] = useState({ labels: [], datasets: [] });

  const [currentPage] = useState('dashboard');
  const [modalType, setModalType] = useState(null); 
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  // 4. LÓGICA DE GRÁFICO (HELPER) - Transforma os dados do backend (GastoPorCategoriaDTO) no formato do Chart.js
  const formatChartData = (label, dataList, valueField) => {
    const labels = dataList.map(item => item.categoriaNome);
    const data = dataList.map(item => item[valueField]); // ex: item.totalGasto
    const backgroundColor = dataList.map(item => item.categoriaCor);
    
    // Calcula o total para encontrar a porcentagem
    const total = data.reduce((sum, val) => sum + val, 0);
    
    // Converte valores absolutos em porcentagens
    const percentageData = data.map(val => (total > 0 ? (val / total) * 100 : 0));

    return {
      labels,
      datasets: [{
        label: label,
        data: percentageData, // Gráfico mostra porcentagens
        backgroundColor,
        borderRadius: 6,
      }],
    };
  };

  // 5. fetchData AGORA CHAMA getDashboardData
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Busca os dados do dashboard e as categorias em paralelo
      const [dashboardData, cats] = await Promise.all([
        getDashboardData(), // <- Nova chamada de API
        getCategories() // Para os modais
      ]);
      
      // Atualiza os estados dos Cards
      setSaldoAtual(dashboardData.saldoAtualGeral);
      setReceitas(dashboardData.totalReceitasGeral);
      setDespesas(dashboardData.totalDespesasGeral);

      // Atualiza os estados dos Gráficos
      setDespesasChartData(
        formatChartData('Despesas (%)', dashboardData.gastosPorCategoria, 'totalGasto')
      );
      setReceitasChartData(
        formatChartData('Receitas (%)', dashboardData.receitasPorCategoria, 'totalRecebido')
      );

      // Atualiza categorias (para os modais)
      setCategories(cats);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Roda apenas uma vez

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed.y.toFixed(2)}%`,
        },
      },
    },
    scales: { y: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } } },
  };

  const handleNavigate = (key) => {
    switch (key) {
      case 'dashboard': navigate('/dashboard'); break;
      case 'transacoes': navigate('/'); break;
      case 'categorias-list': navigate('/categorias'); break;
      case 'relatorio': navigate('/relatorios'); break;
      default: break;
    }
  };

  const handleNewTransaction = (type) => {
    setTransactionToEdit(null);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setTransactionToEdit(null);
  };

  const { despesaCategories, receitaCategories } = useMemo(() => {
    if (!categories) return { despesaCategories: [], receitaCategories: [] };
    const despesasCat = categories.filter(c => c.tipo.toUpperCase() === 'DESPESA');
    const receitasCat = categories.filter(c => c.tipo.toUpperCase() === 'RECEITA');
    return { despesaCategories: despesasCat, receitaCategories: receitasCat };
  }, [categories]);

  if (loading) {
     return <div className="loading-spinner">Carregando dashboard...</div>;
  }

  return (
    <div className="page-layout">
      <Sidebar
        activePage={currentPage}
        onNavigate={handleNavigate}
        onNewTransaction={handleNewTransaction}
      />

      <div className="main-content-area">
        <h1>Dashboard</h1>

        {/* 8. SummaryCards agora usam os estados simples */}
        <div className="summary-cards-container">
          <div className="summary-card">
            <div className="card-header"><h3>Saldo atual</h3><FaUniversity className="income-icon" /></div>
            {/* Usa o estado 'saldoAtual' */}
            <p className="card-value">R$ {saldoAtual.toFixed(2)}</p>
          </div>
          <div className="summary-card" style={{ backgroundColor: '#f0f0f0', cursor: 'pointer' }} onClick={() => handleNewTransaction('receita')}>
            <div className="card-header"><h3>Receitas</h3><FaArrowUp className="income-icon" /></div>
            {/* Usa o estado 'receitas' */}
            <p className="card-value">R$ {receitas.toFixed(2)}</p>
          </div>
          <div className="summary-card" style={{ backgroundColor: '#f0f0f0', cursor: 'pointer' }} onClick={() => handleNewTransaction('despesa')}>
            <div className="card-header"><h3>Despesas</h3><FaArrowDown className="expense-icon" /></div>
            {/* Usa o estado 'despesas' */}
            <p className="card-value">R$ {despesas.toFixed(2)}</p>
          </div>
        </div>

        {/* 9. Gráficos agora usam os estados 'despesasChartData' e 'receitasChartData' */}
        <div className="charts-row">
          <div className="chart-card">
            <h3>Despesas por categoria (%)</h3>
            <Bar data={despesasChartData} options={chartOptions} />
          </div>
          <div className="chart-card">
            <h3>Receitas por categoria (%)</h3>
            <Bar data={receitasChartData} options={chartOptions} />
          </div>
        </div>

        <div className="dashboard-vermais-container">
          <button
            className="dashboard-vermais-button"
            onClick={() => navigate('/relatorios')}
          >
            Ver mais
          </button>
        </div>

{/* 10. Modais agora usam as listas de categorias filtradas */}
        {modalType === 'despesa' && (
          <Telacriacaodesp
            transactionToEdit={transactionToEdit}
            onClose={handleCloseModal}
            onSaveSuccess={fetchData} // Chama fetchData para atualizar o dashboard
            categories={despesaCategories} // Passa a lista filtrada
          />
        )}
        {modalType === 'receita' && (
          <Telacriacaoreceita
            transactionToEdit={transactionToEdit}
            onClose={handleCloseModal}
            onSaveSuccess={fetchData} // Chama fetchData para atualizar o dashboard
            categories={receitaCategories} // Passa a lista filtrada
          />
        )}
      </div>
    </div>
  );
};

export default Teladashboard;
