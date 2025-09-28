// src/services/mockApi.js

// Simula o banco de dados de TRANSAÇÕES em memória
let MOCK_DB = [
    // Data no formato YYYY-MM-DD para compatibilidade com input type="date"
    { id: 1, status: 'warning', date: '2025-09-08', description: 'Alimentação', category: 'Alimentação', account: 'Nubank', tipoPagamento: 'cartao', valor: -410.90, tipo: 'despesa' },
    { id: 2, status: 'ok', date: '2025-09-08', description: 'Aluguel', category: 'Moradia', account: 'Nubank', tipoPagamento: 'pix', valor: -1500.00, tipo: 'despesa' },
    { id: 3, status: 'ok', date: '2025-09-08', description: 'Salário', category: 'Renda Principal', account: 'Carteira', tipoPagamento: 'pix', valor: 5000.00, tipo: 'receita' },
    { id: 4, status: 'ok', date: '2025-09-09', description: 'Renda extra', category: 'Renda Extra', account: 'Carteira', tipoPagamento: 'boleto', valor: 500.00, tipo: 'receita' },
];

let nextId = 5; 

// Simula o banco de dados de CATEGORIAS em memória (Cores vivas para o novo design)
let MOCK_CATEGORIES = [
    { id: 101, name: 'Alimentação', color: '#FF6347', type: 'despesa' },     // Vermelho vivo
    { id: 102, name: 'Moradia', color: '#B22222', type: 'despesa' },         // Vermelho Tijolo
    { id: 103, name: 'Renda Principal', color: '#3CB371', type: 'receita' }, // Verde Sucesso
    { id: 104, name: 'Renda Extra', color: '#FFD700', type: 'receita' },     // Dourado
    { id: 105, name: 'Transporte', color: '#4682B4', type: 'despesa' },      // Azul Aço
    { id: 106, name: 'Lazer', color: '#9370DB', type: 'despesa' },           // Roxo
];

let nextCategoryId = 107;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ===========================================
// --- FUNÇÕES DE TRANSAÇÃO ---
// ===========================================

export const getTransactions = async () => {
    await delay(300);
    // Retorna os dados, já no formato YYYY-MM-DD
    return [...MOCK_DB];
};

export const createTransaction = async (transactionData) => {
    await delay(500);
    const newTransaction = {
        ...transactionData,
        id: nextId++,
        status: 'ok', 
        valor: transactionData.tipo === 'despesa' ? -Math.abs(parseFloat(transactionData.valor)) : Math.abs(parseFloat(transactionData.valor))
    };
    MOCK_DB.push(newTransaction);
    return newTransaction;
};

export const updateTransaction = async (id, transactionData) => {
    await delay(500);
    const index = MOCK_DB.findIndex(t => t.id === id);

    if (index === -1) {
        throw new Error('Transação não encontrada.');
    }
    
    MOCK_DB[index] = { 
        ...MOCK_DB[index], 
        ...transactionData, 
        valor: transactionData.tipo === 'despesa' ? -Math.abs(parseFloat(transactionData.valor)) : Math.abs(parseFloat(transactionData.valor))
    };
    return MOCK_DB[index];
};

export const deleteTransaction = async (id) => {
    await delay(200);
    const initialLength = MOCK_DB.length;
    MOCK_DB = MOCK_DB.filter(t => t.id !== id);
    
    if (MOCK_DB.length === initialLength) {
        throw new Error('Transação não pôde ser excluída.');
    }
    return { success: true };
};

// ===========================================
// --- FUNÇÕES DE CATEGORIA ---
// ===========================================

export const getCategoriesMock = async () => {
    await delay(300);
    return [...MOCK_CATEGORIES];
};

export const createCategoryMock = async (newCategory) => {
  await delay(300);

  const nameLower = newCategory.name.trim().toLowerCase();
  const alreadyExists = MOCK_CATEGORIES.some(cat =>
    cat.name.trim().toLowerCase() === nameLower
  );

  if (alreadyExists) {
    throw new Error("Já existe uma categoria com esse nome.");
  }

  const categoryWithId = { ...newCategory, id: nextCategoryId++ };
  MOCK_CATEGORIES.push(categoryWithId);
  return categoryWithId;
};

export const updateCategoryMock = async (updatedCategory) => {
    await delay(300);
    // CRUCIAL: Usa o ID passado para encontrar o item
    const index = MOCK_CATEGORIES.findIndex(c => c.id === updatedCategory.id);
    
    if (index === -1) {
        // Se o ID não for encontrado, lança o erro que você estava vendo
        throw new Error("Categoria não encontrada para atualização.");
    }
    
    MOCK_CATEGORIES[index] = updatedCategory;
    return updatedCategory;
};

export const deleteCategoryMock = async (id) => {
    await delay(300);
    const initialLength = MOCK_CATEGORIES.length;
    MOCK_CATEGORIES = MOCK_CATEGORIES.filter(c => c.id !== id);
    
    if (MOCK_CATEGORIES.length === initialLength) {
        throw new Error("Categoria não encontrada para exclusão.");
    }
    return { success: true };
};