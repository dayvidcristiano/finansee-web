// src/pages/Telacriacaodesp.js

// --- 1. ADICIONADO 'useMemo' ---
import React, { useState, useEffect, useMemo } from 'react'; 
import { FaTimes } from 'react-icons/fa'; 
import { createTransaction, updateTransaction } from '../services/apiService'; 

// --- 2. ADICIONADO 'transactions' ---
const Telacriacaodesp = ({ transactionToEdit, onClose, onSaveSuccess, categories = [], transactions = [] }) => {
  
 const [formData, setFormData] = useState({
  id: null,
  valor: '',
  data: new Date().toISOString().split('T')[0],
  descricao: '',
  categoriaId: '',
  conta: '',
  formaPagamento: 'PIX',
  tipo: 'despesa'
 });

 const [loading, setLoading] = useState(false);
 const [isEditing, setIsEditing] = useState(false);

 useEffect(() => {
  if (transactionToEdit) {
    setFormData({
     id: transactionToEdit.id,
     valor: Math.abs(transactionToEdit.valor).toFixed(2), 
     data: transactionToEdit.data, 
     descricao: transactionToEdit.descricao,
     categoriaId: transactionToEdit.categoriaId,
     conta: transactionToEdit.conta,
     formaPagamento: transactionToEdit.formaPagamento,
     tipo: 'despesa'
    });
    setIsEditing(true);
  } else {
    setFormData({
    id: null,
    valor: '',
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    categoriaId: '',
    conta: '',
    formaPagamento: 'PIX',
    tipo: 'despesa'
   });
    setIsEditing(false);
  }
 }, [transactionToEdit]);
  
  // --- 3. ADICIONADO 'budgetWarning' (LÓGICA DO ALERTA) ---
 const budgetWarning = useMemo(() => {
    const numericValue = parseFloat(formData.valor) || 0;
    const categoryId = parseInt(formData.categoriaId);

    // Não faz nada se não houver valor ou categoria
    if (!categoryId || numericValue === 0) {
      return null;
    }

    // A prop 'categories' vem do mock (que tem 'orcamento')
    const category = categories.find(c => c.id === categoryId);
    
    // Pega o limite do orçamento
    const budgetLimit = category?.orcamento;
    if (!budgetLimit || budgetLimit === 0) {
      return null; // Categoria não tem orçamento definido
    }

    // A prop 'transactions' vem da API real (que usa 'categoriaId')
    const totalSpent = transactions
      .filter(t => 
        t.categoriaId === categoryId && 
        // Se estiver editando, exclui o valor antigo dessa transação
        t.id !== formData.id 
      )
      .reduce((sum, t) => sum + Math.abs(t.valor), 0);
    
    // Calcula o total (gasto + novo valor)
    const totalAfterExpense = totalSpent + numericValue;
    
    // Pega o nome da categoria (do mock 'name' ou da api 'nome')
    const categoryName = category.name || category.nome;

    // Retorna os avisos
    if (totalAfterExpense > budgetLimit) {
      return `Atenção! Gasto (R$ ${totalAfterExpense.toFixed(2)}) ultrapassará o orçamento de R$ ${budgetLimit.toFixed(2)} para "${categoryName}".`;
    }
    
    if (totalAfterExpense / budgetLimit >= 0.9) {
      return `Cuidado! Você já usou ${((totalAfterExpense / budgetLimit) * 100).toFixed(0)}% do orçamento.`;
    }

    return null; // Tudo OK

  }, [formData.valor, formData.categoriaId, categories, transactions, formData.id]);
  // --------------------------------------------------

 const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
 };

 const handleSave = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
   const dataToSave = {
    ...formData,
    valor: parseFloat(formData.valor)
   };

   if (isEditing) {
     await updateTransaction(dataToSave); 
    } else {
     await createTransaction(dataToSave); 
    }
    onSaveSuccess(); 
    onClose(); 
  } catch (error) {
    console.error("Erro ao salvar despesa:", error);
    alert(`Erro: ${error.message}`);
  } finally {
    setLoading(false);
  }
 };

  // Atualizado para funcionar com 'type' (do mock) ou 'tipo' (da API)
 const expenseCategories = categories.filter(cat => (cat.tipo === 'DESPESA' || cat.type === 'despesa'));

 return (
  <div className="form-modal-overlay">
   <div className="form-card transaction-modal">
    <div className="modal-header">
     <h2>{isEditing ? "Editar Despesa" : "Nova Despesa"}</h2>
     <FaTimes className="icon-close" onClick={onClose} />
    </div>
    
    <form onSubmit={handleSave}>
     <label>Valor</label>
     <div className="input-group">
      <span className="currency-symbol">R$</span>
      <input
       type="number"
       name="valor"
       value={formData.valor}
       onChange={handleChange}
       placeholder="0.00"
       step="0.01"
       required
       className="styled-input"
              // Adicionando o style que você usou no Telacriacaocateg.js
              style={{ border: 'none', padding: '12px 0', margin: 0, borderRadius: 0, fontSize: '1.2rem', fontWeight: 'bold' }}
      />
     </div>
     
     <label>Data</label>
     <input 
      type="date"
      name="data"
      value={formData.data}
      onChange={handleChange}
      required
      className="styled-input"
     />

     <label>Descrição</label>
     <input 
      type="text"
      name="descricao"
      value={formData.descricao}
      onChange={handleChange}
      placeholder="Ex: Conta de luz, Supermercado"
      required
      className="styled-input"
     />
     
     <label>Categoria</label>
nbsp;     <select
      name="categoriaId"
      value={formData.categoriaId}
      onChange={handleChange}
      className="styled-select" 
      required
 s     disabled={loading}
     >
      <option value="" disabled>Selecione uma categoria...</option>
      {expenseCategories.map((cat) => (
       <option key={cat.id} value={cat.id}>
                {/* Mostra 'name' (do mock) ou 'nome' (da API real) */}
        {cat.name || cat.nome}
                {/* --- 4. ADICIONADO: Mostra o orçamento no dropdown --- */}
                {cat.orcamento ? ` (Orçamento: R$ ${cat.orcamento.toFixed(2)})` : ''}
       </option>
      ))}
     </select>

     <label>Conta</label>
     <input 
      type="text"
      name="conta"
      value={formData.conta}
      onChange={handleChange}
      placeholder="Ex: Nubank, Carteira, Banco do Brasil"
      required
      className="styled-input"
     />

     <label>Tipo de pagamento</label>
     <select
      name="formaPagamento"
      value={formData.formaPagamento}
      onChange={handleChange}
      className="styled-select"
      required
     >
      <option value="PIX">Pix</option>
      <option value="BOLETO">Boleto</option>
      <option value="CARTAO_DEBITO">Cartão de Débito</option>
      <option value="CARTAO_CREDITO">Cartão de Crédito</option>
     </select>

        {/* --- 5. ADICIONADO: O ALERTA --- */}
        {budgetWarning && (
          <div className="notification notification-error" style={{ margin: '15px 0' }}>
            {budgetWarning}
          </div>
        )}

     <button type="submit" className="create-button" disabled={loading}>
      {loading ? "Salvando..." : (isEditing ? "Editar" : "Criar")}
     </button>
    </form>
   </div>
  </div>
 );
};

export default Telacriacaodesp;