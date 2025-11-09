import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios'; // <-- Importação do Axios
import Sidebar from '../components/Sidebar';
import SummaryCards from '../components/SummaryCards';
import MonthSelector from '../components/MonthSelector';
import Telacategoria from './Telacategoria';
import Telacriacaocateg from './Telacriacaocateg';
import {
  getTransactions,
  getCategories,
  createCategory,
  updateCategory
} from '../services/apiService';

const CategoryLegend = ({ data, totalDespesasMes }) => {
  const formatCurrency = (value) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
  const [modalType, setModalType] = useState(null);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);
  const currentPage = 'relatorio';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transData, catData] = await Promise.all([
        getTransactions(),
        getCategories()
      ]);
      setTransactions(transData);
      setCategories(catData);
    } catch (err) {
      console.error('Falha ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNewTransaction = (type) => {
    if (type === 'categoria') {
      setModalType('categoria');
      setCategoryToEdit(null);
      setShowCategoryDetails(false);
    } else {
      navigate('/');
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setCategoryToEdit(null);
    setShowCategoryDetails(false);
  };

  const handleEditCategory = (category) => {
    setCategoryToEdit(category);
    setShowCategoryDetails(true);
  };

  const handleCreateNewCategory = () => {
    setCategoryToEdit(null);
    setShowCategoryDetails(true);
  };

  const handleBackToCategories = () => {
    setCategoryToEdit(null);
    setShowCategoryDetails(false);
  };

  const handleSaveCategorySuccess = async (savedCategory) => {
    try {
      if (savedCategory.id) {
        await updateCategory(savedCategory);
      } else {
        await createCategory(savedCategory);
      }
      await fetchData();
      setShowCategoryDetails(false);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getCurrentDate = useMemo(() => {
    const [monthName, yearStr] = currentMonth.split(' ');
    const monthIndex = monthNames.findIndex((name) => name === monthName);
    const year = parseInt(yearStr);
    return new Date(year, monthIndex, 1);
  }, [currentMonth]);

  const handleMonthChange = (direction) => {
    const currentDate = getCurrentDate;
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + (direction === 'next' ? 1 : -1),
      1
    );
    const newMonthName = monthNames[newDate.getMonth()];
    const newYear = newDate.getFullYear();
    setCurrentMonth(`${newMonthName} ${newYear}`);
  };

  const getMonthAndYear = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const month = date.toLocaleString('pt-BR', { month: 'long' });
    const year = date.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  };

  const transactionsInCurrentMonth = useMemo(() => {
    const currentMonthYear = currentMonth.toLowerCase();
    return transactions.filter(
      (t) =>
        t.date &&
        getMonthAndYear(t.date).toLowerCase() === currentMonthYear
    );
  }, [transactions, currentMonth]);

  const { totalReceitasGeral, totalDespesasGeral, saldoAtualGeral } = useMemo(() => {
    const totalR = transactions.filter((t) => t.valor > 0).reduce((sum, t) => sum + t.valor, 0);
    const totalD = transactions.filter((t) => t.valor < 0).reduce((sum, t) => sum + Math.abs(t.valor), 0);
    const saldo = totalR - totalD;
    return {
      totalReceitasGeral: totalR,
      totalDespesasGeral: totalD,
      saldoAtualGeral: saldo
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    const despesasDoMes = transactionsInCurrentMonth.filter((t) => t.valor < 0);
    const totalDespesasMes = despesasDoMes.reduce((sum, t) => sum + Math.abs(t.valor), 0);
    if (totalDespesasMes === 0) return { data: [], total: 0 };

    const categoryTotals = despesasDoMes.reduce((acc, transaction) => {
      const categoryName = transaction.categoria?.nome || 'Outros';
      const value = Math.abs(transaction.valor);
      acc[categoryName] = (acc[categoryName] || 0) + value;
      return acc;
    }, {});

    const formattedData = Object.keys(categoryTotals).map((name) => {
      const value = categoryTotals[name];
      const percentage = Math.round((value / totalDespesasMes) * 100);
      const categoryDetails = categories.find((c) => c.nome === name);
      const color = categoryDetails ? categoryDetails.cor : '#42a5f5';
      return { name, value, percentage, color };
    }).sort((a, b) => b.percentage - a.percentage);

    return { data: formattedData, total: totalDespesasMes };
  }, [transactionsInCurrentMonth, categories]);

  const { data: reportData, total: totalDespesasMes } = chartData;

  // --- FUNÇÃO DE EXPORTAÇÃO ---
  const handleExport = async (format) => { // 'format' pode ser 'pdf' ou 'excel'
    console.log(`Preparando para exportar para ${format.toUpperCase()}:`, { reportData, totalDespesasMes, currentMonth });

    const payload = {
      data: reportData,
      totalDespesasMes: totalDespesasMes,
      currentMonth: currentMonth
    };

    try {
      const endpoint = `/api/relatorios/exportar-${format}`; // Ex: /api/relatorios/exportar-pdf
      const mediaType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const fileExtension = format === 'pdf' ? 'pdf' : 'xlsx';

      const response = await axios.post(endpoint, payload, {
        responseType: 'blob', // MUITO IMPORTANTE para receber o arquivo
        headers: {
          // 'Authorization': `Bearer ${seuTokenDeAutenticacao}` // Adicione se sua API requer token
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: mediaType }));
      const link = document.createElement('a');
      link.href = url;
      
      const nomeArquivo = `Relatorio_${currentMonth.replace(' ', '_')}.${fileExtension}`;
      link.setAttribute('download', nomeArquivo);
      
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(`Relatório exportado com sucesso para ${format.toUpperCase()}!`); // Feedback para o usuário

    } catch (error) {
      console.error(`Erro ao exportar relatório para ${format.toUpperCase()}:`, error);
      alert(`Erro ao exportar relatório para ${format.toUpperCase()}. Por favor, tente novamente.`);
      // Aqui você pode adicionar uma lógica mais sofisticada para mostrar erros ao usuário
    }
  };
  // ------------------------------------------

  if (loading) return <div className="loading-spinner">Carregando relatórios...</div>;

  return (
    <div className="page-layout">
      <Sidebar
        activePage={currentPage}
        onNavigate={(key) => navigate(`/${key}`)}
        onNewTransaction={handleNewTransaction}
      />

      <div className="main-content-area">
        <h1 className="relatorio-title">Relatórios</h1>

        <SummaryCards
          saldoAtual={saldoAtualGeral}
          receitas={totalReceitasGeral}
          despesas={totalDespesasGeral}
        />

        <div className="relatorio-main-card">
          
          {/* ----- ÁREA MODIFICADA ----- */}
          {/* Container com classes CSS para os controles do cabeçalho */}
          <div className="relatorio-header-controls">
            <MonthSelector
              currentMonth={currentMonth}
              onPrevious={() => handleMonthChange('previous')}
              onNext={() => handleMonthChange('next')}
              isReportContext={true}
            />
            
            {/* Botões de exportação usando as classes CSS */}
            <div className="export-buttons-group">
              <button 
                onClick={() => handleExport('pdf')} 
                className="btn-exportar"
              >
                Exportar PDF
              </button>
              <button 
                onClick={() => handleExport('excel')} 
                className="btn-exportar"
              >
                Exportar Excel
              </button>
            </div>
          </div>
          {/* ----- FIM DA ÁREA MODIFICADA ----- */}


          <div className="relatorio-content-flex">
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
                  <Bar dataKey="value" maxBarSize={60}>
                    {reportData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <CategoryLegend data={reportData} totalDespesasMes={totalDespesasMes} />
          </div>
        </div>

        {/* Modais de Categoria */}
        {modalType === 'categoria' && !showCategoryDetails && (
          <Telacategoria
            onClose={handleCloseModal}
            onEditCategory={handleEditCategory}
            onCreateNewCategory={handleCreateNewCategory}
            categories={categories}
            onDeleteCategory={() => {}}
          />
        )}

        {modalType === 'categoria' && showCategoryDetails && (
          <Telacriacaocateg
            categoryToEdit={categoryToEdit}
            onClose={handleCloseModal}
            onBackToCategories={handleBackToCategories}
            onSaveSuccess={handleSaveCategorySuccess}
          />
        )}
      </div>
    </div>
  );
};

export default TelaRelatorio;