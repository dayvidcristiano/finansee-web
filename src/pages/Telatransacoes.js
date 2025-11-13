// src/pages/Telatransacoes.js

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import SummaryCards from '../components/SummaryCards';
// import MonthSelector from '../components/MonthSelector';
import TransactionList from '../components/TransactionList';
import Telacriacaodesp from './Telacriacaodesp'; 
import Telacriacaoreceita from './Telacriacaoreceita'; 
import Telacategoria from './Telacategoria'; 
import Telacriacaocateg from './Telacriacaocateg'; 
import Telaexcluirdr from './Telaexcluirdr';
import './filters-container.css';

import { 
    deleteTransaction, 
    getTransactions, 
    getCategories,      
    updateCategory,     
    createCategory,     
    deleteCategory      
} from '../services/apiService'; 

const Filters = ({ categories, filters, onFilterChange, onApplyFilters, onClearFilters, loading }) => {
    return (
        // O container principal usa a classe CSS
        <div className='filters-container'> 
            
            {/* Grupo: Tipo */}
            <div className="filter-group"> {/* Adiciona classe para o grupo */}
                <span className="filter-label">Tipo:</span> {/* Adiciona classe para o label */}
                <select 
                    name="tipo" 
                    value={filters.tipo || ''} 
                    onChange={onFilterChange}
                    className="styled-select" // Remove 'filter-select' se não for mais necessário
                
                >
                    <option value="">Todos</option>
                    <option value="RECEITA">Receitas</option>
                    <option value="DESPESA">Despesas</option>
                </select>
            </div>

            {/* Grupo: Categoria */}
            <div className="filter-group">
                <span className="filter-label">Categoria:</span>
                <select
                    name='categoriaId'
                    value={filters.categoriaId || ''}
                    onChange={onFilterChange}
                    className="styled-select" 
                
                >
                    <option value="">Todas</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nome}
                        </option>
                    ))}
                </select>
            </div>

            {/* Grupo: Data Início */}
            <div className="filter-group">
                <span className="filter-label">De:</span> {/* Texto mais curto */}
                <input
                    type="date"
                    name='dataInicio'
                    value={filters.dataInicio || ''}
                    onChange={onFilterChange}
                    className="styled-input" 
                
                />
            </div>

            {/* Grupo: Data Fim */}
            <div className="filter-group">
                <span className="filter-label">Até:</span> {/* Texto mais curto */}
                <input
                    type="date"
                    name='dataFim'
                    value={filters.dataFim || ''}
                    onChange={onFilterChange}
                    className="styled-input" 
                
                />
            </div>

            <div className="filter-group">
                        <span className="filter-label">Valor mínimo:</span>
                        <input
                        type="number"
                        name='valorMin'
                        placeholder="0"
                        value={filters.valorMin || ''}
                        onChange={onFilterChange}
                        className="styled-input"
                        />
                    </div>

                    <div className="filter-group">
                        <span className="filter-label">Valor máximo:</span>
                        <input
                        type="number"
                        name='valorMax'
                        placeholder="0"
                        value={filters.valorMax || ''}
                        onChange={onFilterChange}
                        className="styled-input"
                        />
                    </div>

            {/* Botões ficam diretamente no container flex */}
            <button onClick={onApplyFilters} className="filter-button apply-button">
                 {loading ? 'Filtrando...' : 'Filtrar'}
            </button>
            <button onClick={onClearFilters} className="filter-button clear-button">
                Limpar
            </button>
        </div>
    );
}


const Telatransacoes = () => {
    const navigate = useNavigate();

    // ESTADOS PRINCIPAIS
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [modalType, setModalType] = useState(null);

    // FILTROS
    const [filters, setFilters] = useState({
        tipo: "",
        categoriaId: "",
        dataInicio: "",
        dataFim: "",
        valorMin: "",
        valorMax: ""
    });

    // ESTADOS DE EDIÇÃO E NAVEGAÇÃO
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [categoryToEdit, setCategoryToEdit] = useState(null);
    const [showCategoryDetails, setShowCategoryDetails] = useState(false);
    const [currentPage] = useState('transacoes');
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    // --- FUNÇÕES DE NAVEGAÇÃO ---
    const handleNavigate = (key) => {
        switch (key) {
            case 'dashboard': navigate('/dashboard'); break;
            case 'transacoes': navigate('/'); break;
            case 'categorias-list': navigate('/categorias'); break;
            case 'relatorio': navigate('/relatorios'); break;
            default: break;
        }
    };

    const handleDeleteClick = (transaction) => { setTransactionToDelete(transaction); };
    const handleConfirmDelete = async () => {
        if (!transactionToDelete) return;
        try {
            await deleteTransaction(transactionToDelete);
            setNotification({ type: 'success', message: 'Transação excluída com sucesso!' });
            fetchData();
        } catch (error) {
            setNotification({ type: 'error', message: error.message || 'Falha ao excluir a transação.' });
        } finally {
            setTransactionToDelete(null);
        }
    };
    const handleCancelDelete = () => setTransactionToDelete(null);
    const handleCloseModal = () => {
        setModalType(null);
        setTransactionToEdit(null);
        setCategoryToEdit(null);
        setShowCategoryDetails(false);
        setTransactionToDelete(null);
    };

    // --- FUNÇÕES DE CARREGAMENTO ---
    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            console.error("Falha ao carregar categorias:", err);
            setNotification({ type: 'error', message: 'Falha ao carregar as categorias.' });
        }
    };

    const fetchData = useCallback(async (currentFilters) => {
        setLoading(true);
        setNotification(null);
        // Usa os filtros passados ou o estado atual se nenhum for passado
        const filtersToUse = currentFilters || filters; 
        try {
            const filterParams = {
                tipo: filtersToUse.tipo || null,
                categoriaId: filtersToUse.categoriaId || null,
                dataInicio: filtersToUse.dataInicio || null,
                dataFim: filtersToUse.dataFim || null,
                valorMin: filtersToUse.valorMin || null,
                valorMax: filtersToUse.valorMax || null
            };
            Object.keys(filterParams).forEach(key =>
                filterParams[key] == null && delete filterParams[key]
            );
            console.log("Fetching data with filters:", filterParams);
            const data = await getTransactions(filterParams);
            setTransactions(data);
        } catch (err) { 
            console.error("Erro ao buscar transações:", err); // Log mais detalhado
            setNotification({ type: 'error', message: 'Falha ao carregar as transações.' }); 
        } finally { 
            setLoading(false); 
        } 
    }, [filters]);

    useEffect(() => {
        fetchCategories();
        fetchData();
    }, []);

    

    // --- MEMORIZAÇÃO E CÁLCULOS ---
    const { receitas, despesas, saldoAtual } = useMemo(() => {
        const totalReceitas = transactions.filter(t => t.valor > 0).reduce((sum, t) => sum + t.valor, 0);
        const totalDespesas = transactions.filter(t => t.valor < 0).reduce((sum, t) => sum + Math.abs(t.valor), 0);
        const saldo = totalReceitas - totalDespesas;
        return { receitas: totalReceitas, despesas: totalDespesas, saldoAtual: saldo };
    }, [transactions]);

    const { despesaCategories, receitaCategories } = useMemo(() => {
        if (!categories) return { despesaCategories: [], receitaCategories: [] };
        const despesas = categories.filter(c => c.tipo.toUpperCase() === 'DESPESA');
        const receitas = categories.filter(c => c.tipo.toUpperCase() === 'RECEITA');
        return { despesaCategories: despesas, receitaCategories: receitas };
    }, [categories]);

    // --- HANDLERS ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value // Guarda o valor (string vazia se limpo)
        }));
    };

    const handleApplyFilters = () => {
        fetchData(); // Chama a busca com os filtros atuais no estado 'filters'
    };
    
    // Handler para limpar filtros
    const handleClearFilters = () => {
        const clearedFilters = {tipo: "", categoriaId: "", dataInicio: "", dataFim: "", valorMin: "", valorMax: "" };
        setFilters(clearedFilters);
        fetchData(clearedFilters);
    };

    const handleNewTransaction = (type) => {
        setTransactionToEdit(null);
        setCategoryToEdit(null);
        setShowCategoryDetails(false);
        if (type === 'despesa' || type === 'receita') setModalType(type);
        else if (type === 'categoria') setModalType('categoria');
    };

    const handleEdit = (transaction) => {
        setTransactionToEdit(transaction);
        setModalType(transaction.valor < 0 ? 'despesa' : 'receita');
    };

    const handleDelete = async (transaction) => {
        if (window.confirm(`Tem certeza que deseja excluir a transação de R$${Math.abs(transaction.valor).toFixed(2).replace('.', ',')} - "${transaction.description}"?`)) {
            try {
                await deleteTransaction(transaction);
                setNotification({ type: 'success', message: 'Transação excluída com sucesso!' });
                fetchData();
            } catch (error) {
                setNotification({ type: 'error', message: error.message || 'Falha ao excluir a transação.' });
            }
        }
    };

    const handleEditCategory = (category) => {
        setCategoryToEdit(category);
        setShowCategoryDetails(true);
    };

    const handleCreateNewCategory = () => {
        setCategoryToEdit(null);
        setShowCategoryDetails(true);
    };

    const handleSaveCategorySuccess = async (savedCategory) => {
        setNotification(null);
        try {
            if (savedCategory.id) await updateCategory(savedCategory);
            else await createCategory(savedCategory);
            await fetchCategories();
            setCategoryToEdit(null);
            setShowCategoryDetails(false);
            setNotification({ type: 'success', message: `Categoria "${savedCategory.nome}" salva com sucesso!` });
        } catch (error) {
            console.error("Erro na API ao salvar categoria:", error);
            setNotification({ type: 'error', message: `Erro ao salvar categoria: ${error.message}` });
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) return;
        setNotification(null);
        try {
            await deleteCategory(categoryId);
            setNotification({ type: 'success', message: 'Categoria excluída com sucesso!' });
            fetchCategories();
        } catch (error) {
            console.error("Erro ao excluir categoria:", error);
            setNotification({ type: 'error', message: error.message });
        }
    };

    

    if (loading) return <div className="loading-spinner">Entrando no sistema...</div>;

    // --- RENDERIZAÇÃO ---
    return (
        <div className="page-layout">
            <Sidebar
                activePage={currentPage}
                onNavigate={handleNavigate}
                onNewTransaction={handleNewTransaction}
            />

            <div className="main-content-area">
                {notification && (
                    <div className={`notification notification-${notification.type}`}>
                        {notification.message}
                    </div>
                )}

                {(modalType === 'despesa' || modalType === 'receita') && (
                    modalType === 'despesa' ? (
                        <Telacriacaodesp
                            transactionToEdit={transactionToEdit}
                            onClose={handleCloseModal}
                            onSaveSuccess={fetchData}
                            categories={despesaCategories}
                        />
                    ) : (
                        <Telacriacaoreceita
                            transactionToEdit={transactionToEdit}
                            onClose={handleCloseModal}
                            onSaveSuccess={fetchData}
                            categories={receitaCategories}
                        />
                    )
                )}

                {modalType === 'categoria' && !showCategoryDetails && (
                    <Telacategoria
                        onClose={handleCloseModal}
                        onEditCategory={handleEditCategory}
                        onCreateNewCategory={handleCreateNewCategory}
                        categories={categories}
                        onDeleteCategory={handleDeleteCategory}
                    />
                )}

                {modalType === 'categoria' && showCategoryDetails && (
                    <Telacriacaocateg
                        categoryToEdit={categoryToEdit}
                        onClose={handleCloseModal}
                        onBackToCategories={() => {
                            setCategoryToEdit(null);
                            setShowCategoryDetails(false);
                        }}
                        onSaveSuccess={handleSaveCategorySuccess}
                    />
                )}

                {transactionToDelete && (
                    <Telaexcluirdr
                        onConfirm={handleConfirmDelete}
                        onCancel={handleCancelDelete}
                    />
                )}

                {/* Seção de Filtros */}
                <div className="filters-section" style={{ marginBottom: '20px' }}>
                    <h2>Filtrar Transações</h2>
                    {/* 8. Passa as NOVAS funções para o componente Filters */}
                    <Filters 
                        categories={categories} 
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onApplyFilters={handleApplyFilters} // <-- Usa a função do botão
                        onClearFilters={handleClearFilters} // <-- Usa a função do botão Limpar
                    />
                </div>

                <div className="transactions-header-section">
                    <h1>Transações</h1>
                    <div className="table-wrapper-card">
                        
                        <TransactionList
                            transactions={transactions}
                            onDelete={handleDeleteClick}
                            onEdit={handleEdit}
                        />
                    </div>
                </div>

                <SummaryCards
                    saldoAtual={saldoAtual}
                    receitas={receitas}
                    despesas={despesas}
                /> 
            </div>
        </div>
    );
};

export default Telatransacoes;
