// rastreamento.js
console.log('✅ Rastreamento SPA + tabela + Firebase carregado');

import { database } from '../../../firebase_connection/firebaseConfig.js';
import { ref, get, update } from
    "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {

    /* ================= USUÁRIO ================= */
    const userUID = localStorage.getItem('currentUserUID');
    const userTipo = localStorage.getItem('currentUserTipo');

    if (!userUID || !userTipo) return;

    /* ================= ELEMENTOS ================= */
    const pendentesBody  = document.getElementById('pendentes-body');
    const andamentoBody  = document.getElementById('andamento-body');
    const entreguesBody  = document.getElementById('entregues-body');
    const canceladosBody = document.getElementById('cancelados-body');

    /* ================= SPA ================= */
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            document.querySelectorAll('.spa-section').forEach(s => s.classList.remove('ativa'));
            document.getElementById(btn.dataset.section)?.classList.add('ativa');
        });
    });

    carregarPendentes();
    carregarAndamento();
    carregarEntregues();
    carregarCancelados();

    /* ================= BASE ================= */
    async function carregarBase() {
        const [transacoesSnap, pecasSnap] = await Promise.all([
            get(ref(database, 'transacoes')),
            get(ref(database, 'pecas'))
        ]);

        return {
            transacoes: transacoesSnap.exists() ? transacoesSnap.val() : {},
            pecas: pecasSnap.exists() ? pecasSnap.val() : {}
        };
    }

    /* ================= PENDENTES ================= */
    async function carregarPendentes() {
        pendentesBody.innerHTML = '';

        const { transacoes, pecas } = await carregarBase();
        const { doacao = {}, compra = {} } = transacoes;

        /* DOAÇÕES */
        Object.entries(doacao).forEach(([id, d]) => {
            if (d.status !== 'Pendente') return;
            if (d.doadorUID !== userUID && d.instituicaoUID !== userUID) return;

            const ehDoador = d.doadorUID === userUID; // só doador envia
            const ehInstituicao = d.instituicaoUID === userUID;

            pendentesBody.appendChild(
                criarLinha({
                    transacaoId: id,
                    tipo: 'Doação',
                    nomePeca: pecas[d.pecaUID]?.titulo || 'Peça não encontrada',
                    destino: d.enderecoDestino,
                    status: d.status,
                    botao: ehDoador
                        ? criarGrupoBotoes([
                            botaoEnviar(() =>
                                atualizarStatus(`transacoes/doacao/${id}`, 'Em andamento')
                            ),
                            botaoCancelar(() =>
                                cancelarTransacao({
                                    tipo: 'Doação',
                                    transacaoId: id,
                                    pecaUID: d.pecaUID
                                })
                            )
                        ])
                        : botaoAguardando()

                })
            );
        });

        /* ================= COMPRAS ================= */
        Object.entries(compra).forEach(([id, c]) => {
            if (c.status !== 'Pendente') return;

            const peca = pecas[c.pecaUID];
            if (!peca) return;

            // NORMALIZA CAMPOS
            const vendedorUID = String(
                c.vendedorUID ||
                c.vendedorUid ||
                peca.ownerUid || // fallback
                ''
            ).trim();

            const compradorUID = String(
                c.compradorUID ||
                c.compradorUid ||
                ''
            ).trim();

            // SE O USUÁRIO NÃO PARTICIPA, NÃO MOSTRA
            if (userUID !== vendedorUID && userUID !== compradorUID) return;

            const ehVendedor   = userUID === vendedorUID;
            const ehComprador = userUID === compradorUID;

            pendentesBody.appendChild(
                criarLinha({
                    transacaoId: id,
                    tipo: 'Venda',
                    nomePeca: peca.titulo || 'Peça não encontrada',
                    destino: c.enderecoDestino,
                    status: c.status,
                    botao: ehVendedor
                        ? criarGrupoBotoes([
                            botaoEnviar(() =>
                                atualizarStatus(`transacoes/compra/${id}`, 'Em andamento')
                            ),
                            botaoCancelar(() =>
                                cancelarTransacao({
                                    tipo: 'Venda',
                                    transacaoId: id,
                                    pecaUID: c.pecaUID
                                })
                            )
                        ])
                        : ehComprador
                            ? botaoAguardando() // COMPRADOR VE “AGUARDANDO”
                            : botaoAguardando()
                })
            );
        });
    }

    /* ================= EM ANDAMENTO ================= */
    async function carregarAndamento() {
        andamentoBody.innerHTML = '';

        const { transacoes, pecas } = await carregarBase();
        const { doacao = {}, compra = {} } = transacoes;

        /* DOAÇÕES */
        Object.entries(doacao).forEach(([id, d]) => {
            if (d.status !== 'Em andamento') return;
            if (d.doadorUID !== userUID && d.instituicaoUID !== userUID) return;

            const podeConfirmar = d.instituicaoUID === userUID;

            andamentoBody.appendChild(
                criarLinha({
                    transacaoId: id,
                    tipo: 'Doação',
                    nomePeca: pecas[d.pecaUID]?.titulo || 'Peça não encontrada',
                    destino: d.enderecoDestino,
                    status: d.status,
                    botao: podeConfirmar
                        ? botaoConfirmar(() =>
                            confirmarEntrega({
                                path: `transacoes/doacao/${id}`,
                                pecaUID: d.pecaUID,
                                novoOwner: d.instituicaoUID
                            })
                          )
                        : botaoAguardandoConfirmacao()
                })
            );
        });

        /* COMPRAS */
        /* COMPRAS */
        /* COMPRAS */
        Object.entries(compra).forEach(([id, c]) => {
            if (c.status !== 'Em andamento') return;

            // normaliza os campos
            const vendedorUID = String(c.vendedorUID || c.vendedorUid || c.ownerUid || c.vendedor || '').trim();
            const compradorUID = String(c.compradorUID || c.compradorUid || c.comprador || '').trim();

            // se o usuário não participa, sai
            if (vendedorUID !== userUID && compradorUID !== userUID) return;

            // comprador confirma
            const podeConfirmar = compradorUID === userUID;

            andamentoBody.appendChild(
                criarLinha({
                    transacaoId: id,
                    tipo: 'Venda',
                    nomePeca: pecas[c.pecaUID]?.titulo || 'Peça não encontrada',
                    destino: c.enderecoDestino,
                    status: c.status,
                    botao: podeConfirmar
                        ? botaoConfirmar(() =>
                            confirmarEntrega({
                                path: `transacoes/compra/${id}`,
                                pecaUID: c.pecaUID,
                                novoOwner: compradorUID
                            })
                        )
                        : botaoAguardandoConfirmacao()
                })
            );
        });

    }

    /* ================= ENTREGUES ================= */
    async function carregarEntregues() {
        entreguesBody.innerHTML = '';

        const { transacoes, pecas } = await carregarBase();
        const { doacao = {}, compra = {} } = transacoes;

        Object.entries(doacao).forEach(([id, d]) => {
            if (d.status === 'Entregue' &&
                (d.doadorUID === userUID || d.instituicaoUID === userUID)) {

                const ehNovoOwner = d.instituicaoUID === userUID;

                entreguesBody.appendChild(
                    criarLinha({
                        transacaoId: id,
                        tipo: 'Doação',
                        nomePeca: pecas[d.pecaUID]?.titulo || 'Peça não encontrada',
                        destino: d.enderecoDestino,
                        status: d.status,
                        botao: ehNovoOwner ? botaoInserirGaveta(d.pecaUID) : botaoConcluido()
                    })
                );
            }
        });

        Object.entries(compra).forEach(([id, c]) => {
            if (c.status === 'Entregue' &&
                (c.vendedorUID === userUID || c.compradorUID === userUID)) {

                const ehNovoOwner = c.compradorUID === userUID;

                entreguesBody.appendChild(
                    criarLinha({
                        transacaoId: id,
                        tipo: 'Venda',
                        nomePeca: pecas[c.pecaUID]?.titulo || 'Peça não encontrada',
                        destino: c.enderecoDestino,
                        status: c.status,
                        botao: ehNovoOwner ? botaoInserirGaveta(c.pecaUID) : botaoConcluido()
                    })
                );
            }
        });
    }

    /* ================= CANCELADOS ================= */
    async function carregarCancelados() {
        if (!canceladosBody) return;
        canceladosBody.innerHTML = '';

        const { transacoes, pecas } = await carregarBase();
        const { doacao = {}, compra = {} } = transacoes;

        Object.entries(doacao).forEach(([id, d]) => {
            if (d.status === 'Cancelado' && (d.doadorUID === userUID || d.instituicaoUID === userUID)) {
                canceladosBody.appendChild(
                    criarLinha({
                        transacaoId: id,
                        tipo: 'Doação',
                        nomePeca: pecas[d.pecaUID]?.titulo || 'Peça não encontrada',
                        destino: d.enderecoDestino,
                        status: d.status,
                        botao: botaoConcluido()
                    })
                );
            }
        });

        Object.entries(compra).forEach(([id, c]) => {
            if (c.status === 'Cancelado' && (c.vendedorUID === userUID || c.compradorUID === userUID)) {
                canceladosBody.appendChild(
                    criarLinha({
                        transacaoId: id,
                        tipo: 'Venda',
                        nomePeca: pecas[c.pecaUID]?.titulo || 'Peça não encontrada',
                        destino: c.enderecoDestino,
                        status: c.status,
                        botao: botaoConcluido()
                    })
                );
            }
        });
    }

    /* ================= AÇÕES ================= */

    async function cancelarTransacao({ tipo, transacaoId, pecaUID }) {
        const statusPeca = tipo === 'Doação' ? 'Doar' : 'Vender';
        const path = `transacoes/${tipo === 'Doação' ? 'doacao' : 'compra'}/${transacaoId}`;

        await update(ref(database, path), { status: 'Cancelado' });
        await update(ref(database, `pecas/${pecaUID}`), { finalidade: statusPeca });

        carregarPendentes();
        carregarCancelados();
    }

    async function confirmarEntrega({ path, pecaUID, novoOwner }) {
        await update(ref(database, path), { status: 'Entregue' });
        await update(ref(database, `pecas/${pecaUID}`), {
            ownerUid: novoOwner,
            gavetaUid: null
        });

        carregarAndamento();
        carregarEntregues();
    }

    async function atualizarStatus(path, status) {
        await update(ref(database, path), { status });
        carregarPendentes();
        carregarAndamento();
    }

    /* ================= COMPONENTES UI ================= */

    // normaliza string para classe (remove acentos e espaços)
    function slugifyClass(str) {
        return String(str)
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove diacríticos
            .replace(/\s+/g, '-')
            .toLowerCase();
    }

    function criarLinha({ transacaoId, tipo, nomePeca, destino, status, botao }) {
        const tipoClass = slugifyClass(tipo); // ex: "doacao" ou "venda"
        const statusClass = slugifyClass(status); // ex: "em-andamento" ou "entregue"

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${transacaoId}</strong></td>
            <td><span class="badge-tipo ${tipoClass}">${tipo}</span></td>
            <td>${escapeHtml(nomePeca)}</td>
            <td class="col-destino">${escapeHtml(destino || '—')}</td>
            <td><span class="badge-status ${statusClass}"><i class="bi bi-truck"></i> ${status}</span></td>
            <td class="col-acao"></td>
        `;
        tr.lastElementChild.appendChild(botao);
        return tr;
    }

    // pequeno helper para evitar XSS se algum título vier do DB
    function escapeHtml(text) {
        return String(text)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function criarGrupoBotoes(botoes) {
        const div = document.createElement('div');
        div.className = 'grupo-botoes';
        botoes.forEach(b => div.appendChild(b));
        return div;
    }

    // criarBotao agora já aplica classe visual 'btn-acao'
    function criarBotao(texto, classe, icon = null, onClick = null, disabled = false) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn-acao ${classe}`;
        btn.innerHTML = `${icon ? `<i class="bi bi-${icon}"></i>` : ''}<span>${texto}</span>`;
        if (onClick && !disabled) btn.addEventListener('click', onClick);
        if (disabled) btn.disabled = true;
        return btn;
    }

    const botaoEnviar = fn => criarBotao('Enviar pedido', 'btn-enviar', 'truck', fn);
    const botaoCancelar = fn => criarBotao('Cancelar', 'btn-cancelar', 'x-circle', fn);
    const botaoConfirmar = fn => criarBotao('Pedido entregue', 'btn-confirmar', 'check-circle', fn);
    const botaoAguardando = () => criarBotao('Aguardando', 'btn-aguardo', 'hourglass-split', null, true);
    const botaoAguardandoConfirmacao = () => criarBotao('Aguardando confirmação', 'btn-aguardo', 'hourglass', null, true);
    const botaoConcluido = () => criarBotao('Pedido concluído!', 'btn-concluido', 'check-circle-fill', null, true);
    const botaoInserirGaveta = pecaUID => criarBotao('Inserir peça em gaveta', 'btn-gaveta', 'box-seam', () => {
        window.location.href = `inserir.html?idPeca=${encodeURIComponent(pecaUID)}`;
    });

});