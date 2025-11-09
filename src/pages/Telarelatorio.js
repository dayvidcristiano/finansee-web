import React, { useState, useEffect, useMemo, useCallback } from 'react'; // 1. Adiciona useCallback
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { saveAs } from 'file-saver'; // 2. Importa o 'saveAs' para downloads

import Sidebar from '../components/Sidebar';
import SummaryCards from '../components/SummaryCards';
import MonthSelector from '../components/MonthSelector';
import Telacategoria from './Telacategoria';
import Telacriacaocateg from './Telacriacaocateg';

import { 
  getCategories,
  createCategory,
  updateCategory,
  getGastosPorCategoria,
  exportarRelatorioPDF
} from '../services/apiService';

const CategoryLegend = ({ data, totalDespesasMes }) => {
  const formatCurrency = (value) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="relatorio-category-legend">
      <h3>Despesas por categorias</h3>
      {/* 4. CORREÇÃO: Usa 'categoriaNome', 'categoriaCor', e 'totalGasto' */}
      {data.map((item) => (
        <div key={item.categoriaNome} className="relatorio-legend-item">
          <div className="relatorio-legend-icon-and-name">
            <span style={{ backgroundColor: item.categoriaCor }} className="relatorio-legend-icon"></span>
            <div style={{ lineHeight: '1.2' }}>
              <span style={{ fontWeight: 'bold' }}>{item.categoriaNome}</span>
              <br />
              <small>Porcentagem</small>
            </div>
          </div>
          <div className="relatorio-legend-values">
            <span className="value">{formatCurrency(item.totalGasto)}</span>
            <span className="percentage" style={{ color: item.categoriaCor, fontWeight: 'bold' }}>
              {totalDespesasMes > 0 ? ((item.totalGasto / totalDespesasMes) * 100).toFixed(2).replace('.', ',') : 0}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const TelaRelatorio = () => {
  const navigate = useNavigate();

  // 5. ESTADOS CORRIGIDOS
  const [categories, setCategories] = useState([]); // Para os modais
  const [loading, setLoading] = useState(true); // Para o loading do gráfico
  const [loadingExport, setLoadingExport] = useState(false); // Para o botão de exportar
  
  // Estado para os dados do gráfico (vindos da API)
  const [reportData, setReportData] = useState([]); 
  const [totalDespesasMes, setTotalDespesasMes] = useState(0);

  // Estados de navegação e modais
  const [modalType, setModalType] = useState(null);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);
  const currentPage = 'relatorio';

  // 6. LÓGICA DE DATA CORRIGIDA
  // Vamos usar um objeto Date para 'currentDate' para facilitar
  const [currentDate, setCurrentDate] = useState(new Date()); 
  // Deriva 'ano' e 'mes' (para a API) e 'currentMonth' (para a UI) do estado 'currentDate'
  const ano = currentDate.getFullYear();
  const mes = currentDate.getMonth() + 1; // JS Mês é 0-11, API é 1-12
  
  const monthNames = useMemo(() => [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ], []);
  // Gera a string para o MonthSelector
  const currentMonthString = `${monthNames[currentDate.getMonth()]} ${ano}`;
  

  // --- FUNÇÕES DE CARREGAMENTO ---

  // 7. 'fetchData' AGORA É 'fetchReportData' E CHAMA A API CORRETA
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      // 'ano' e 'mes' agora estão definidos corretamente no escopo do componente
      const data = await getGastosPorCategoria(ano, mes); // CHAMA A API DE RELATÓRIO
      
      setReportData(data); // Salva os dados agregados

      // Calcula o total a partir dos dados agregados
      const total = data.reduce((sum, item) => sum + item.totalGasto, 0);
      setTotalDespesasMes(total);

    } catch (err) {
      console.error('Falha ao carregar dados do relatório:', err);
    } finally {
      setLoading(false);
    }
  // Depende de 'ano' e 'mes'
  }, [ano, mes]); 

  // useEffect para buscar categorias (só uma vez)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catData = await getCategories();
        setCategories(catData);
      } catch (err) { console.error('Falha ao carregar categorias:', err); }
    };
    fetchCategories();
  }, []);

  // useEffect para buscar os DADOS DO RELATÓRIO (quando 'fetchReportData' muda)
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

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
      // A função 'fetchData' não existe mais. Devemos chamar 'fetchCategories'
      await fetchCategories(); // <-- CORRIGIDO
      setShowCategoryDetails(false);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };
  // ------------------------------------

  // 8. 'handleMonthChange' ATUALIZA O ESTADO 'currentDate'
  const handleMonthChange = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth() + (direction === 'next' ? 1 : -1),
        1
      );
      return newDate;
    });
    // O useEffect que depende de 'fetchReportData' (que depende de 'ano' e 'mes')
    // será acionado automaticamente e buscará os dados do novo mês.
  };

const totalReceitasGeral = 0; // Ajustar isso requer mais backend
const saldoAtualGeral = 0 - totalDespesasMes;

  // --- FUNÇÃO DE EXPORTAÇÃO ---
  const handleExport = async (format) => {
    if (format === 'excel') {
      alert("Exportação para Excel (XLSX) ainda não implementada.");
      return;
    }
    
    setLoadingExport(true);
    // 'ano' e 'mes' já estão disponíveis no escopo do componente
    try {
        const pdfBlob = await exportarRelatorioPDF(ano, mes); // Chama a API real
      
        // Usa a string do mês para o nome do arquivo
        const nomeArquivo = `Relatorio_${currentMonthString.replace(' ', '_')}.pdf`;
        
        saveAs(pdfBlob, nomeArquivo); // Usa file-saver

    } catch (error) {
      console.error(`Erro ao exportar relatório para PDF:`, error);
      alert(`Erro ao exportar relatório para PDF. Por favor, tente novamente.`);
    } finally {
      setLoadingExport(false);
    }
  };

  // ------------------------------------------

  if (loading) return <div className="loading-spinner">Carregando relatórios...</div>;

  return (
    <div className="page-layout">
      <Sidebar
        activePage={currentPage}
        onNavigate={(key) => navigate(key === 'transacoes' ? '/' : `/${key}`)}
        onNewTransaction={handleNewTransaction}
      />

      <div className="main-content-area">
        <h1 className="relatorio-title">Relatórios</h1>

        <SummaryCards
          saldoAtual={saldoAtualGeral} 
          receitas={totalReceitasGeral} 
          despesas={totalDespesasMes} 
        />

        <div className="relatorio-main-card">
          <div className="relatorio-header-controls">
            <MonthSelector
              currentMonth={currentMonthString} // Passa a string formatada
              onPrevious={() => handleMonthChange('previous')}
              onNext={() => handleMonthChange('next')}
              isReportContext={true}
            />
            
            <div className="export-buttons-group">
              <button 
                onClick={() => handleExport('pdf')} 
                className="btn-exportar"
                disabled={loadingExport} // Desabilita durante o download
              >
                {loadingExport ? 'Gerando...' : 'Exportar PDF'}
              </button>
              <button 
                onClick={() => handleExport('excel')} 
                className="btn-exportar"
                disabled={loadingExport}
              >
                Exportar Excel (em breve)
              </button>
            </div>
          </div>
          
          {/* Container do gráfico e legenda */}
          <div className="relatorio-content-flex">
            <div className="relatorio-chart-container">
              {loading ? (
                <div className="loading-spinner">Carregando gráfico...</div>
              ) : reportData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  {/* Gráfico CORRIGIDO para usar os dados do backend */}
                <BarChart data={reportData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="categoriaNome" hide /> 
                  <YAxis hide />
                  <Tooltip
                    formatter={(value, name, props) => [
                      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                      props.payload.categoriaNome 
                    ]}
                  />
                  <Bar dataKey="totalGasto"> 
                    {reportData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.categoriaCor} /> 
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              ) : (
                <p>Nenhuma despesa encontrada para este período.</p>
              )}
            </div>
            {/* Passa os dados corretos para a legenda */}
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