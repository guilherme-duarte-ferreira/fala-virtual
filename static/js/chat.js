import { iniciarChat, mostrarTelaInicial, adicionarMensagem, mostrarCarregamento } from './chatUI.js';
import { enviarMensagem, interromperResposta } from './chatActions.js';
import { 
    carregarConversa, 
    atualizarListaConversas, 
    copiarMensagem, 
    regenerarResposta, 
    renomearConversa, 
    excluirConversa 
} from './chatStorage.js';

// Exportar todas as funções necessárias
export {
    iniciarChat,
    mostrarTelaInicial,
    adicionarMensagem,
    mostrarCarregamento,
    enviarMensagem,
    interromperResposta,
    carregarConversa,
    atualizarListaConversas,
    copiarMensagem,
    regenerarResposta,
    renomearConversa,
    excluirConversa
};

// Definir funções globais para uso em eventos inline
window.copiarMensagem = copiarMensagem;
window.regenerarResposta = regenerarResposta;
window.renomearConversa = renomearConversa;
window.excluirConversa = excluirConversa;