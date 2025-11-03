import React, { useEffect, useState, useMemo } from 'react';
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
import { getTransactions, getCategories } from '../services/apiService';
import Telacriacaodesp from './Telacriacaodesp'; 
import Telacriacaoreceita from './Telacriacaoreceita';
import Telacategoria from './Telacategoria';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Teladashboard = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage] = useState('dashboard');
  const [modalType, setModalType] = useState(null); 
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  const fetchData = async () => {
    try {
      const [txs, cats] = await Promise.all([
        getTransactions(),
        getCategories()
      ]);
      setTransactions(txs);
      setCategories(cats);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { receitas, despesas, saldoAtual } = useMemo(() => {
    const totalReceitas = transactions.filter(t => t.valor > 0).reduce((sum, t) => sum + t.valor, 0);
    const totalDespesas = transactions.filter(t => t.valor < 0).reduce((sum, t) => sum + Math.abs(t.valor), 0);
    const saldo = totalReceitas - totalDespesas;
    return { receitas: totalReceitas, despesas: totalDespesas, saldoAtual: saldo };
  }, [transactions]);

  const despesasPorCategoria = useMemo(() => {
    const despesas = transactions.filter(t => t.valor < 0);
    const total = despesas.reduce((sum, t) => sum + Math.abs(t.valor), 0);
    const agrupadas = despesas.reduce((acc, t) => {
      const nome = typeof t.categoria === 'string' ? t.categoria : t.categoria?.nome || 'Outros';
      acc[nome] = (acc[nome] || 0) + Math.abs(t.valor);
      return acc;
    }, {});
    const labels = Object.keys(agrupadas);
    const data = labels.map(label => agrupadas[label] / total * 100);
    const backgroundColor = labels.map(label => {
      const cat = categories.find(c => c.nome === label);
      return cat?.cor || '#888';
    });
    return {
      labels,
      datasets: [{
        label: 'Despesas (%)',
        data,
        backgroundColor,
        borderRadius: 6,
      }],
    };
  }, [transactions, categories]);

  const receitasPorCategoria = useMemo(() => {
    const receitas = transactions.filter(t => t.valor > 0);
    const total = receitas.reduce((sum, t) => sum + t.valor, 0);
    const agrupadas = receitas.reduce((acc, t) => {
      const nome = typeof t.categoria === 'string' ? t.categoria : t.categoria?.nome || 'Outros';
      acc[nome] = (acc[nome] || 0) + t.valor;
      return acc;
    }, {});
    const labels = Object.keys(agrupadas);
    const data = labels.map(label => agrupadas[label] / total * 100);
    const backgroundColor = labels.map(label => {
      const cat = categories.find(c => c.nome === label);
      return cat?.cor || '#888';
    });
    return {
      labels,
      datasets: [{
        label: 'Receitas (%)',
        data,
        backgroundColor,
        borderRadius: 6,
      }],
    };
  }, [transactions, categories]);

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

  return (
    <div className="page-layout">
      <Sidebar
        activePage={currentPage}
        onNavigate={handleNavigate}
        onNewTransaction={handleNewTransaction}
      />

      <div className="main-content-area">
        <h1>Dashboard</h1>

        <div className="summary-cards-container">
          <div className="summary-card">
            <div className="card-header"><h3>Saldo atual</h3><FaUniversity className="income-icon" /></div>
            <p className="card-value">R$ {saldoAtual.toFixed(2)}</p>
          </div>

          <div className="summary-card" style={{ backgroundColor: '#f0f0f0', cursor: 'pointer' }} onClick={() => handleNewTransaction('receita')}>
            <div className="card-header"><h3>Receitas</h3><FaArrowUp className="income-icon" /></div>
            <p className="card-value">R$ {receitas.toFixed(2)}</p>
          </div>

          <div className="summary-card" style={{ backgroundColor: '#f0f0f0', cursor: 'pointer' }} onClick={() => handleNewTransaction('despesa')}>
            <div className="card-header"><h3>Despesas</h3><FaArrowDown className="expense-icon" /></div>
            <p className="card-value">R$ {despesas.toFixed(2)}</p>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-card">
            <h3>Despesas por categoria</h3>
            <Bar data={despesasPorCategoria} options={chartOptions} />
          </div>
          <div className="chart-card">
            <h3>Receitas por categoria</h3>
            <Bar data={receitasPorCategoria} options={chartOptions} />
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

        {modalType === 'despesa' && (
          <Telacriacaodesp
            transactionToEdit={transactionToEdit}
            onClose={handleCloseModal}
            onSaveSuccess={async () => { await fetchData(); }} 
            categories={categories}
          />
        )}
        {modalType === 'receita' && (
          <Telacriacaoreceita
            transactionToEdit={transactionToEdit}
            onClose={handleCloseModal}
            onSaveSuccess={async () => { await fetchData(); }}
            categories={categories}
          />
        )}
        {modalType === 'categoria' && (
          <Telacategoria
            onClose={handleCloseModal}
            onEditCategory={() => {}}
            onCreateNewCategory={() => {}}
            categories={categories}
            onDeleteCategory={() => {}}
          />
        )}
      </div>
    </div>
  );
};

export default Teladashboard;
