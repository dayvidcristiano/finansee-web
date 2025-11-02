// src/pages/Telacriacaoreceita.js

import React, { useState, useEffect } from 'react'; 
import { FaTimes } from 'react-icons/fa'; 
import { createTransaction, updateTransaction } from '../services/apiService';

const Telacriacaoreceita = ({ transactionToEdit, onClose, onSaveSuccess, categories = [] }) => {
    
  const [formData, setFormData] = useState({
     id: null,
     valor: '',
     data: new Date().toISOString().split('T')[0], // name="data"
     descricao: '',   // name="descricao"
     categoriaId: '', // name="categoriaId" (armazena o ID)
     conta: '',       // name="conta"
     formaPagamento: 'PIX', // name="formaPagamento"
     tipo: 'receita'
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
          tipo: 'receita'
        });
        setIsEditing(true);
     } else {
      // Reseta o formulário para criação (com os nomes corretos)
        setFormData({
        id: null,
        valor: '',
        data: new Date().toISOString().split('T')[0],
        descricao: '',
        categoriaId: '',
        conta: '',
        formaPagamento: 'PIX', 
        tipo: 'receita'
      });
        setIsEditing(false);
     }
   }, [transactionToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dataToSave = { ...formData, valor: parseFloat(formData.valor) };

    try {
      if (isEditing) {
        await updateTransaction(dataToSave); 
      } else {
        await createTransaction(dataToSave);
      }
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar receita:", error);
      alert(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const incomeCategories = categories.filter(cat => cat.tipo === 'RECEITA');

  return (
    <div className="form-modal-overlay">
      <div className="form-card transaction-modal">
        <div className="modal-header">
          <h2>{isEditing ? "Editar Receita" : "Nova Receita"}</h2>
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
            placeholder="Ex: Salário, Venda de Produto"
            required
            className="styled-input"
          />
          
          <label>Categoria</label>
          <select
            name="categoriaId"
            value={formData.categoriaId}
            onChange={handleChange}
            className="styled-select" 
            required
            disabled={loading}
          >
            <option value="" disabled>Selecione uma categoria...</option>
            {incomeCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
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
            name="tipoPagamento"
            value={formData.tipoPagamento}
            onChange={handleChange}
            className="styled-select"
            required
          >
            <option value="PIX">Pix</option>
            <option value="BOLETO">Boleto</option>
            <option value="CARTAO_CREDITO">Cartão de Crédito</option>
            <option value="CARTAO_DEBITO">Cartão de Débito</option>
          </select>

          <button type="submit" className="create-button" disabled={loading}>
            {loading ? "Salvando..." : (isEditing ? "Editar" : "Criar")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Telacriacaoreceita;
