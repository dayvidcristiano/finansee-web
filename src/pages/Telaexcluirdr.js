// src/pages/Telaexcluirdr.js
import React from 'react';
// 1. Importe o CSS aqui
import './Telaexcluirdr.css'; 

function Telaexcluirdr({ onConfirm, onCancel }) {
  // ... (o JSX permanece o mesmo, pois as classes já foram adicionadas)
  return (
    <div className="modal-overlay">
      <div className="confirm-modal-content">
        <h4>Deseja mesmo excluir essa despesa/receita?</h4>
        <div className="confirm-modal-actions">
          <button onClick={onCancel} className="cancel-button">
            Cancelar
          </button>
          <button onClick={onConfirm} className="confirm-button">
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Telaexcluirdr;