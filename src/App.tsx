import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, FileText, CheckCircle2, Clock, 
  DollarSign, FileCheck, Tag, Building2, Calendar, 
  Paperclip, Sun, Moon, ArrowRight, ChevronRight, X, Filter, AlertCircle,
  Phone
} from 'lucide-react';

// Dados Iniciais de Exemplo baseados no layout e imagem fornecida
const initialProcessos = [
  {
    id: '1',
    empenho: '2026NE0001',
    processo: '23079.234435/2025-12',
    beneficiario: 'EMBALAGENS LTDA',
    cnpj: '23.829.669/0001-96',
    telefone: '(11) 98765-4321',
    objeto: 'PAPEL HIGIENICO (Material de Limpeza)',
    classificacao: 'CUSTEIO',
    fonte: 'Participativo',
    modalidade: 'ATA',
    valorBruto: 25230.98,
    darfRetencao: 306.01,
    statusGeral: 'CONCLUÍDO',
    dataCriacao: '15/01/2026',
    historico: [
      {
        id: 'h1',
        data: '15/01/2026',
        status: 'EMPENHADO',
        corStatus: 'bg-emerald-500',
        descricao: 'Empenho emitido no sistema e enviado ao fornecedor.',
        documentoAnexo: 'Nota de Empenho nº 2026NE0001.pdf'
      },
      {
        id: 'h2',
        data: '28/01/2026',
        status: 'AGUARDANDO NF',
        corStatus: 'bg-emerald-500',
        descricao: 'Material entregue no almoxarifado. Aguardando emissão da NF.',
        documentoAnexo: 'Termo de Recebimento Provisório.pdf'
      },
      {
        id: 'h3',
        data: '05/02/2026',
        status: 'EM LIQUIDAÇÃO',
        corStatus: 'bg-emerald-500',
        descricao: 'Nota Fiscal nº 618 atestada. Calculado DARF de R$ 306,01.',
        documentoAnexo: 'NF 618 + Ateste de Conformidade.pdf'
      },
      {
        id: 'h4',
        data: '10/02/2026',
        status: 'AGUARDANDO PAGAMENTO',
        corStatus: 'bg-amber-500',
        descricao: 'Processo enviado para a Tesouraria para emissão da OB.',
        documentoAnexo: 'Ordem Bancária OB12345.pdf'
      },
      {
        id: 'h5',
        data: '12/02/2026',
        status: 'CONCLUÍDO',
        corStatus: 'bg-emerald-500',
        descricao: 'Pagamento efetuado e comprovante anexado ao processo.',
        documentoAnexo: 'Comprovante de Transferência.pdf'
      }
    ]
  },
  {
    id: '2',
    empenho: '2026NE0002',
    processo: '23079.234450/2025-88',
    beneficiario: 'TECH & INFORMAÇÕES S.A.',
    cnpj: '04.123.987/0001-22',
    telefone: '(21) 99876-5432',
    objeto: 'SERVIDORES E MONITORES LCD',
    classificacao: 'INVESTIMENTO',
    fonte: 'Próprio',
    modalidade: 'PREGÃO',
    valorBruto: 63400.50,
    darfRetencao: 225.00,
    statusGeral: 'EM ANDAMENTO',
    dataCriacao: '18/01/2026',
    historico: [
      {
        id: 'h21',
        data: '18/01/2026',
        status: 'EMPENHADO',
        corStatus: 'bg-emerald-500',
        descricao: 'Empenho de material permanente emitido.',
        documentoAnexo: 'Nota de Empenho nº 2026NE0002.pdf'
      },
      {
        id: 'h22',
        data: '02/02/2026',
        status: 'AGUARDANDO NF',
        corStatus: 'bg-amber-500',
        descricao: 'Equipamentos entregues e sob análise técnica TI.',
        documentoAnexo: 'Relatorio_Tecnico_Inspeção.pdf'
      }
    ]
  }
];

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [processos, setProcessos] = useState(initialProcessos);
  const [selectedId, setSelectedId] = useState(initialProcessos[0]?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('TODOS');

  // Modais State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isHistModalOpen, setIsHistModalOpen] = useState(false);

  // Form State para Novo Processo
  const [novoProcesso, setNovoProcesso] = useState({
    empenho: '',
    processo: '',
    beneficiario: '',
    cnpj: '',
    telefone: '',
    objeto: '',
    classificacao: 'CUSTEIO',
    fonte: 'Participativo',
    modalidade: 'ATA',
    valorBruto: '',
    darfRetencao: '',
    statusGeral: 'EM ANDAMENTO'
  });

  // Form State para Nova Ocorrência Timeline
  const [novaOcorrencia, setNovaOcorrencia] = useState({
    data: new Date().toISOString().split('T')[0].split('-').reverse().join('/'),
    status: 'EM LIQUIDAÇÃO',
    descricao: '',
    documentoAnexo: ''
  });

  // Processo Selecionado
  const selectedProcesso = useMemo(() => {
    return processos.find((p) => p.id === selectedId) || processos[0];
  }, [processos, selectedId]);

  // Cálculos de Resumo
  const totalBruto = useMemo(() => processos.reduce((acc, p) => acc + p.valorBruto, 0), [processos]);
  const totalRetencao = useMemo(() => processos.reduce((acc, p) => acc + p.darfRetencao, 0), [processos]);
  const totalLiquido = totalBruto - totalRetencao;
  const totalConcluidos = useMemo(() => processos.filter((p) => p.statusGeral === 'CONCLUÍDO').length, [processos]);
  const totalEmAndamento = useMemo(() => processos.filter((p) => p.statusGeral !== 'CONCLUÍDO').length, [processos]);

  // Filtragem da Lista
  const filteredProcessos = useMemo(() => {
    return processos.filter((p) => {
      const matchSearch =
        p.empenho.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.beneficiario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.objeto.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchClass = filterClass === 'TODOS' || p.classificacao === filterClass;

      return matchSearch && matchClass;
    });
  }, [processos, searchTerm, filterClass]);

  // Handlers
  const handleCreateProcesso = (e) => {
    e.preventDefault();
    const bruto = parseFloat(novoProcesso.valorBruto) || 0;
    const retencao = parseFloat(novoProcesso.darfRetencao) || 0;

    const newObj = {
      ...novoProcesso,
      id: String(Date.now()),
      valorBruto: bruto,
      darfRetencao: retencao,
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      historico: [
        {
          id: String(Date.now() + 1),
          data: new Date().toLocaleDateString('pt-BR'),
          status: 'EMPENHADO',
          corStatus: 'bg-emerald-500',
          descricao: 'Cadastro inicial do processo no sistema.',
          documentoAnexo: `Nota_Empenho_${novoProcesso.empenho}.pdf`
        }
      ]
    };

    setProcessos([newObj, ...processos]);
    setSelectedId(newObj.id);
    setIsNewModalOpen(false);
    setNovoProcesso({
      empenho: '',
      processo: '',
      beneficiario: '',
      cnpj: '',
      telefone: '',
      objeto: '',
      classificacao: 'CUSTEIO',
      fonte: 'Participativo',
      modalidade: 'ATA',
      valorBruto: '',
      darfRetencao: '',
      statusGeral: 'EM ANDAMENTO'
    });
  };

  const handleAddOcorrencia = (e) => {
    e.preventDefault();
    if (!selectedProcesso) return;

    const newHistItem = {
      id: String(Date.now()),
      data: novaOcorrencia.data,
      status: novaOcorrencia.status,
      corStatus: novaOcorrencia.status === 'CONCLUÍDO' ? 'bg-emerald-500' : 'bg-amber-500',
      descricao: novaOcorrencia.descricao,
      documentoAnexo: novaOcorrencia.documentoAnexo || 'Documento sem anexo'
    };

    const updatedProcessos = processos.map((p) => {
      if (p.id === selectedProcesso.id) {
        return {
          ...p,
          statusGeral: novaOcorrencia.status === 'CONCLUÍDO' ? 'CONCLUÍDO' : p.statusGeral,
          historico: [...p.historico, newHistItem]
        };
      }
      return p;
    });

    setProcessos(updatedProcessos);
    setIsHistModalOpen(false);
    setNovaOcorrencia({
      data: new Date().toLocaleDateString('pt-BR'),
      status: 'EM LIQUIDAÇÃO',
      descricao: '',
      documentoAnexo: ''
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val || 0);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* HEADER / BARRA SUPERIOR DA APLICAÇÃO */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md ${darkMode ? 'bg-[#1e293b]/90 border-slate-700/60' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">SISTEMA DE ACOMPANHAMENTO DE PROCESSOS</h1>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Ficha de Registro e Histórico de Ocorrências</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg border transition-all ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-amber-400'
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
              title={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium">Usuário Conectado</div>
              <div className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Edson000733</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* CARDS DE RESUMO FINANCEIRO E DE PROCESSOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className={`p-4 rounded-xl border shadow-sm transition-all ${darkMode ? 'bg-[#1e293b] border-slate-700/60' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Valor Bruto</span>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 text-xl font-bold tracking-tight text-blue-500">
              {formatCurrency(totalBruto)}
            </div>
          </div>

          <div className={`p-4 rounded-xl border shadow-sm transition-all ${darkMode ? 'bg-[#1e293b] border-slate-700/60' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>DARF / Retenção</span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 text-xl font-bold tracking-tight text-rose-500">
              {formatCurrency(totalRetencao)}
            </div>
          </div>

          <div className={`p-4 rounded-xl border shadow-sm transition-all ${darkMode ? 'bg-[#1e293b] border-slate-700/60' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Valor Líquido</span>
              <FileCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-xl font-bold tracking-tight text-emerald-500">
              {formatCurrency(totalLiquido)}
            </div>
          </div>

          <div className={`p-4 rounded-xl border shadow-sm transition-all ${darkMode ? 'bg-[#1e293b] border-slate-700/60' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Concluídos</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-xl font-bold tracking-tight text-emerald-500">
              {totalConcluidos}
            </div>
          </div>

          <div className={`p-4 rounded-xl border shadow-sm transition-all ${darkMode ? 'bg-[#1e293b] border-slate-700/60' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Em Andamento</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 text-xl font-bold tracking-tight text-amber-500">
              {totalEmAndamento}
            </div>
          </div>
        </div>

        {/* ESTRUTURA DE 2 COLUNAS (ESTILO DASHBOARD NOTION) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUNA ESQUERDA: LISTA & BUSCA */}
          <div className={`lg:col-span-5 rounded-2xl border p-4 shadow-sm flex flex-col h-[740px] ${darkMode ? 'bg-[#1e293b] border-slate-700/60' : 'bg-white border-slate-200'}`}>
            
            {/* Topo da lista */}
            <div className="space-y-3 pb-3 border-b border-slate-700/30">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm uppercase tracking-wider text-slate-400">Processos Cadastrados</h2>
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Novo Empenho
                </button>
              </div>

              {/* Barra de Pesquisa */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por empenho, processo ou beneficiário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border outline-none transition-all ${
                    darkMode
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Filtro por Classificação */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {['TODOS', 'CUSTEIO', 'INVESTIMENTO'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterClass(cat)}
                    className={`px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap text-[11px] ${
                      filterClass === cat
                        ? 'bg-blue-600 text-white'
                        : darkMode
                        ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista dos Cards de Processos */}
            <div className="flex-1 overflow-y-auto pt-3 space-y-2.5 pr-1">
              {filteredProcessos.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Nenhum processo encontrado com esses termos.
                </div>
              ) : (
                filteredProcessos.map((item) => {
                  const isSelected = item.id === selectedProcesso?.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? darkMode
                            ? 'bg-blue-900/30 border-blue-500/70 shadow-md ring-1 ring-blue-500/30'
                            : 'bg-blue-50/80 border-blue-300 shadow-sm ring-1 ring-blue-400/30'
                          : darkMode
                          ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80'
                          : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-sm tracking-wide text-blue-400">{item.empenho}</span>
                          <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Proc: {item.processo}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.classificacao === 'CUSTEIO'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          }`}
                        >
                          {item.classificacao}
                        </span>
                      </div>

                      <div className="mt-2 text-xs font-medium truncate">
                        {item.beneficiario}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-700/20">
                        <span className="text-slate-400">{item.dataCriacao}</span>
                        <span className={`font-semibold ${item.statusGeral === 'CONCLUÍDO' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {item.statusGeral}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: FICHA DE DETALHES & TIMELINE (TIMELINE ESTILO NOTION) */}
          <div className={`lg:col-span-7 rounded-2xl border p-6 shadow-sm min-h-[740px] flex flex-col justify-between ${darkMode ? 'bg-[#1e293b] border-slate-700/60' : 'bg-white border-slate-200'}`}>
            {selectedProcesso ? (
              <div className="space-y-6">
                
                {/* CABEÇALHO DO PROCESSO SELECIONADO */}
                <div className="border-b pb-5 border-slate-700/40">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs px-2.5 py-1 font-bold rounded-md bg-blue-600 text-white">
                        {selectedProcesso.modalidade}
                      </span>
                      <span className="text-xs px-2.5 py-1 font-bold rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {selectedProcesso.classificacao}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsHistModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Nova Movimentação
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row justify-between sm:items-baseline gap-2">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">{selectedProcesso.empenho}</h2>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Nº Processo: <span className="font-mono text-blue-400">{selectedProcesso.processo}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Valor Líquido</div>
                      <div className="text-xl font-extrabold text-emerald-400">
                        {formatCurrency(selectedProcesso.valorBruto - selectedProcesso.darfRetencao)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PAINEL DE INFORMAÇÕES TÉCNICAS */}
                <div className={`p-4 rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-4 ${darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Beneficiário</span>
                    <div className="text-xs font-bold mt-0.5">{selectedProcesso.beneficiario}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">CNPJ: {selectedProcesso.cnpj}</div>
                    {selectedProcesso.telefone && (
                      <div className="text-[11px] text-blue-400 mt-1 flex items-center gap-1 font-medium">
                        <Phone className="w-3 h-3" />
                        <span>{selectedProcesso.telefone}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Objeto</span>
                    <div className="text-xs font-bold mt-0.5">{selectedProcesso.objeto}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/20">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Classificação / Fonte</span>
                    <div className="text-xs mt-0.5">
                      Classificação: <b>{selectedProcesso.classificacao}</b> | Fonte: <b>{selectedProcesso.fonte}</b>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/20">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Detalhamento Financeiro</span>
                    <div className="text-xs mt-0.5 space-x-2">
                      <span>Bruto: <b>{formatCurrency(selectedProcesso.valorBruto)}</b></span>
                      <span className="text-rose-400">| DARF: <b>{formatCurrency(selectedProcesso.darfRetencao)}</b></span>
                    </div>
                  </div>
                </div>

                {/* HISTÓRICO DE MOVIMENTAÇÕES E DOCUMENTOS (TIMELINE ESTILO NOTION) */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Histórico de Movimentações e Documentos
                  </h3>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700/50">
                    {selectedProcesso.historico.map((item, idx) => (
                      <div key={item.id || idx} className="relative group">
                        
                        {/* Ícone Indicador do Ponto da Linha do Tempo */}
                        <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ${darkMode ? 'ring-[#1e293b]' : 'ring-white'} ${item.corStatus || 'bg-emerald-500'}`}>
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>

                        {/* Conteúdo do Card da Ocorrência */}
                        <div className={`p-3.5 rounded-xl border transition-all ${darkMode ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className="text-xs font-bold text-blue-400">
                              {item.data} - <span className="uppercase tracking-wide">{item.status}</span>
                            </span>
                          </div>

                          <p className={`text-xs mt-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            {item.descricao}
                          </p>

                          {item.documentoAnexo && (
                            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-medium">
                              <Paperclip className="w-3 h-3" />
                              <span>Documento Anexo: {item.documentoAnexo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                Selecione um processo à esquerda para visualizar os detalhes.
              </div>
            )}
          </div>

        </div>
      </main>

      {/* MODAL: NOVO PROCESSO / EMPENHO */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative ${darkMode ? 'bg-[#1e293b] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <button
              onClick={() => setIsNewModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-500" />
              Cadastrar Novo Empenho / Processo
            </h3>

            <form onSubmit={handleCreateProcesso} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nº Empenho</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: 2026NE0003"
                    value={novoProcesso.empenho}
                    onChange={(e) => setNovoProcesso({ ...novoProcesso, empenho: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nº Processo</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: 23079.00123/2026-00"
                    value={novoProcesso.processo}
                    onChange={(e) => setNovoProcesso({ ...novoProcesso, processo: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Beneficiário</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: FORNECEDOR ABC LTDA"
                    value={novoProcesso.beneficiario}
                    onChange={(e) => setNovoProcesso({ ...novoProcesso, beneficiario: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={novoProcesso.cnpj}
                    onChange={(e) => setNovoProcesso({ ...novoProcesso, cnpj: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Telefone de Contato</label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={novoProcesso.telefone}
                  onChange={(e) => setNovoProcesso({ ...novoProcesso, telefone: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Objeto / Descrição Resumida</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Material de Limpeza / Papel"
                  value={novoProcesso.objeto}
                  onChange={(e) => setNovoProcesso({ ...novoProcesso, objeto: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Classificação</label>
                  <select
                    value={novoProcesso.classificacao}
                    onChange={(e) => setNovoProcesso({ ...novoProcesso, classificacao: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="CUSTEIO">CUSTEIO</option>
                    <option value="INVESTIMENTO">INVESTIMENTO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fonte</label>
                  <input
                    type="text"
                    placeholder="Participativo"
                    value={novoProcesso.fonte}
                    onChange={(e) => setNovoProcesso({ ...novoProcesso, fonte: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Modalidade</label>
                  <input
                    type="text"
                    placeholder="ATA"
                    value={novoProcesso.modalidade}
                    onChange={(e) => setNovoProcesso({ ...novoProcesso, modalidade: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Valor Bruto (R$)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={novoProcesso.valorBruto}
                    onChange={(e) => setNovoProcesso({ ...novoProcesso, valorBruto: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">DARF / Retenção (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={novoProcesso.darfRetencao}
                    onChange={(e) => setNovoProcesso({ ...novoProcesso, darfRetencao: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                >
                  Salvar Processo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA MOVIMENTAÇÃO / LINHA DO TEMPO */}
      {isHistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative ${darkMode ? 'bg-[#1e293b] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <button
              onClick={() => setIsHistModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" />
              Adicionar Nova Ocorrência
            </h3>

            <form onSubmit={handleAddOcorrencia} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Data</label>
                  <input
                    required
                    type="text"
                    placeholder="DD/MM/AAAA"
                    value={novaOcorrencia.data}
                    onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, data: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Status da Etapa</label>
                  <select
                    value={novaOcorrencia.status}
                    onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, status: e.target.value })}
                    className={`w-full p-2.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="EMPENHADO">EMPENHADO</option>
                    <option value="AGUARDANDO NF">AGUARDANDO NF</option>
                    <option value="EM LIQUIDAÇÃO">EM LIQUIDAÇÃO</option>
                    <option value="AGUARDANDO PAGAMENTO">AGUARDANDO PAGAMENTO</option>
                    <option value="CONCLUÍDO">CONCLUÍDO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Descrição / Despacho</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Nota Fiscal atestada e encaminhada para pagamento..."
                  value={novaOcorrencia.descricao}
                  onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, descricao: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Documento Anexo (Nome do arquivo)</label>
                <input
                  type="text"
                  placeholder="Ex: NF_618_Atestada.pdf"
                  value={novaOcorrencia.documentoAnexo}
                  onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, documentoAnexo: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHistModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                >
                  Registrar Ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
