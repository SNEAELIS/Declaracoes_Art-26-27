// Event listener para o botão "Gerar PDFs" (todas as declarações)
document.getElementById('botaoGerarPDF').addEventListener('click', async function (e) {
    e.preventDefault();
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.style.display = 'block';
    try {
        await generateAllDeclarationsPDF();
        loadingMessage.style.display = 'none';
    } catch (error) {
        alert("Ocorreu um erro ao gerar os PDFs.");
        console.error(error);
        loadingMessage.style.display = 'none';
    }
});

// Event listener para o botão "Gerar PDF Atestado de Capacidade Técnica"
document.getElementById('botaoGerarAtestadoPDF').addEventListener('click', async function (e) {
    e.preventDefault();
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.style.display = 'block';
    try {
        await generateAtestadoPDF();
        loadingMessage.style.display = 'none';
    } catch (error) {
        alert("Ocorreu um erro ao gerar o Atestado PDF.");
        console.error(error);
        loadingMessage.style.display = 'none';
    }
});

// Event listener para o botão "Gerar Termo Compromisso Coordenador PDF"
document.getElementById('generateTermoCompromissoCoordenadorPDF')?.addEventListener('click', async function (e) {
    e.preventDefault();
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.style.display = 'block';
    try {
        await generateTermoCompromissoCoordenadorPDF();
        loadingMessage.style.display = 'none';
    } catch (error) {
        alert("Ocorreu um erro ao gerar o Termo de Compromisso PDF.");
        console.error(error);
        loadingMessage.style.display = 'none';
    }
});

// Função para mostrar/esconder campos do Coordenador
function mostrarCoordenador(resposta) {
    const coordenadorFields = document.getElementById('coordenadorFields');
    if (resposta === 'Sim') {
        coordenadorFields.classList.remove('hidden');
        coordenadorFields.classList.add('visible');
    } else {
        coordenadorFields.classList.add('hidden');
        coordenadorFields.classList.remove('visible');
    }
}

// Função para formatar CPF
function formatarCPF(campo) {
    let matricula = campo.value.replace(/\D/g, '');
    if (matricula.length > 11) matricula = matricula.slice(0, 11);
    campo.value = matricula.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para formatar CNPJ
function formatCNPJ(input) {
    let cnpj = input.value.replace(/\D/g, '');
    if (cnpj.length > 14) cnpj = cnpj.slice(0, 14);
    if (cnpj.length > 12) {
        cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    } else if (cnpj.length > 8) {
        cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})$/, "$1.$2.$3/$4");
    } else if (cnpj.length > 5) {
        cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3})$/, "$1.$2.$3");
    } else if (cnpj.length > 2) {
        cnpj = cnpj.replace(/^(\d{2})(\d{3})$/, "$1.$2");
    }
    input.value = cnpj;
}

// Função para formatar data
function formatDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
}

// Função para converter arquivo (como imagem) para Base64
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

async function processMultipleFiles(files) {
    const results = [];
    for (const file of files) {
        if (file.type.startsWith('image/')) {
            try {
                const base64 = await fileToBase64(file);
                results.push({
                    image: base64,
                    width: 200,
                    height: 150,
                    margin: [0, 5, 0, 10]
                });
            } catch (error) {
                console.error(`Erro ao processar arquivo ${file.name}:`, error);
            }
        }
    }
    return results;
}
// Função para converter imagem para Base64
async function getBase64Image(url) {
    try {
        console.log(`Tentando carregar a imagem do caminho: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro ao carregar a imagem: ${response.status} - ${response.statusText}`);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('Imagem convertida para Base64 com sucesso.');
                resolve(reader.result);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Erro ao converter imagem para Base64:', error);
        return null;
    }
}

// Função para gerar todas as declarações em um único PDF
async function generateAllDeclarationsPDF() {
    const dirigente = document.getElementById('dirigente').value;
    const cpf = document.getElementById('cpf').value;
    const cnpj = document.getElementById('cnpj').value;
    const entidade = document.getElementById('entidade').value;
    const endereco = document.getElementById('endereco').value;
    const proposta = document.getElementById('proposta').value;
    const municipio = document.getElementById('municipio').value;
    const objeto = document.getElementById('objeto').value;
    const uf = document.getElementById('uf').value;
    const cargoDirigente = document.getElementById('cargoDirigente').value;
    const date = formatDate();

    // Carrega a imagem de marca d'água
    const watermarkImage = await getBase64Image('../images/Declarações _page-0001.jpg');

    var docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        background: watermarkImage ? [{
            image: watermarkImage,
            width: 595,
            height: 842,
            absolutePosition: { x: 0, y: 0 },
            opacity: 0.9
        }] : undefined,
        content: [
            // Declaração de Não Utilização de Recursos
            {
                text: 'DECLARAÇÃO DE NÃO UTILIZAÇÃO DE RECURSOS',
                style: 'header',
                alignment: 'center',
                margin: [0, 120, 0, 2]
            },
            {
                text: 'PARA FINALIDADE ALHEIA AO OBJETO DA PARCERIA',
                style: 'header',
                alignment: 'center',
                margin: [0, 0, 0, 2]
            },
            {
                text: [
                    `Eu, ${dirigente}, CPF nº ${cpf}, na condição de representante legal da ${entidade}, CNPJ nº ${cnpj}, declaro para os devidos fins de celebração de Termo de Fomento no âmbito do Ministério do Esporte - MESP, que a presente Entidade, `,
                    { text: 'não utilizará os recursos para finalidade alheia ao objeto da parceria', bold: true },
                    `.\n\nPor ser expressão da verdade, firmo a presente declaração.`
                ],
                alignment: 'justify',
                fontSize: 12,
                margin: [0, 20, 0, 10]
            },
            {
                text: `${municipio}/${uf}, na data da assinatura digital.`,
                alignment: 'left',
                fontSize: 12,
                margin: [0, 40, 0, 20]
            },
            {
                text: `${cargoDirigente}\n\n`,
                alignment: 'center',
                fontSize: 12,
                margin: [0, 40, 0, 20]
            },
            { text: '', pageBreak: 'after' },

            // Declaração de Ausência de Destinação de Recursos
            {
                text: 'DECLARAÇÃO DE AUSÊNCIA DE DESTINAÇÃO DE RECURSOS',
                style: 'header',
                alignment: 'center',
                margin: [0, 130, 0, 2]
            },
            {
                text: [
                    `Eu, ${dirigente}, CPF nº ${cpf}, na condição de representante legal da ${entidade}, CNPJ nº ${cnpj}, declaro que os recursos do presente Termo de Fomento não se destinarão ao pagamento de despesas com pessoal ativo, inativo ou pensionista, dos Estados, do Distrito Federal e Municípios, conforme o art. 167, inciso X, da Constituição Federal de 1988 e art. 25, § 1º, inciso III, da Lei Complementar nº 101/2000.\n\n`,
                    'Por ser expressão da verdade, firmo a presente declaração.'
                ],
                alignment: 'justify',
                fontSize: 12,
                margin: [0, 20, 0, 10]
            },
            {
                text: `${municipio}/${uf}, na data da assinatura digital.`,
                alignment: 'left',
                fontSize: 12,
                margin: [0, 40, 0, 20]
            },
            {
                text: `${cargoDirigente}\n\n`,
                alignment: 'center',
                fontSize: 12,
                margin: [0, 40, 0, 20]
            },
            { text: '', pageBreak: 'after' },

            // Declaração de Cumprimento do Art. 90
            {
                text: 'DECLARAÇÃO DE CUMPRIMENTO DO ART. 90 DA',
                style: 'header',
                alignment: 'center',
                margin: [0, 120, 0, 2]
            },
            {
                text: 'LEI Nº 14.791 DE 29 DE DEZEMBRO DE 2023',
                style: 'header',
                alignment: 'center',
                margin: [0, 0, 0, 2]
            },
            {
                text: [
                    `Eu, ${dirigente}, CPF nº ${cpf}, na condição de representante legal da ${entidade}, CNPJ nº ${cnpj}, declaro para os devidos fins, que a presente Entidade, cumprirá com o disposto no art. 90, incisos IV e VIII, da Lei nº 14.791 de 29 de dezembro de 2023:\n\n`,
                    { text: '1. Compromisso da entidade beneficiada de disponibilizar ao cidadão, em seu sítio eletrônico ou, na falta deste, em sua sede, consulta ao extrato do convênio ou instrumento congênere, que conterá, no mínimo, o objeto, a finalidade e o detalhamento da aplicação dos recursos;\n\n', bold: true },
                    { text: '2. A cláusula de reversão patrimonial, válida até a depreciação integral do bem ou a amortização do investimento, constituindo garantia real em favor da concedente, em montante equivalente aos recursos de capital destinados à entidade, cuja execução ocorrerá caso se verifique desvio de finalidade ou aplicação irregular dos recursos.\n\n', bold: true },
                    'Por ser expressão da verdade, firmo a presente declaração.'
                ],
                alignment: 'justify',
                fontSize: 12,
                margin: [0, 20, 0, 10]
            },
            {
                text: `${municipio}/${uf}, na data da assinatura digital.`,
                alignment: 'left',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            {
                text: `${cargoDirigente}\n\n`,
                alignment: 'center',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            { text: '', pageBreak: 'after' },

            // Declaração de Não Contratação com Recursos da Parceria
            {
                text: 'DECLARAÇÃO',
                style: 'header',
                alignment: 'center',
                margin: [0, 120, 0, 2]
            },
            {
                text: 'NÃO CONTRATAÇÃO COM RECURSOS DA PARCERIA',
                style: 'header',
                alignment: 'center',
                margin: [0, 0, 0, 2]
            },
            {
                text: [
                    `Eu, ${dirigente}, CPF nº ${cpf}, na condição de representante legal da ${entidade}, CNPJ nº ${cnpj}, declaro para os devidos fins de celebração de Termo de Fomento no âmbito do Ministério do Esporte - MESP que a presente Entidade `,
                    { text: 'não contratará com recursos da presente parceria:\n\n', bold: true },
                    { text: '1. Empresas que sejam do mesmo grupo econômico;\n', bold: true },
                    { text: '2. Empresas que tenham participação societária cruzada;\n', bold: true },
                    { text: '3. Empresas que pertençam ou possuam participação societária de parentes de dirigentes ou funcionários da entidade;\n', bold: true },
                    { text: '4. Empresas que possuam o mesmo endereço, telefone e CNPJ.\n\n', bold: true },
                    'As cotações relativas aos itens previstos no Plano de Trabalho também não apresentarão incompatibilidades quanto à situação cadastral dos fornecedores e à classificação de atividades econômicas (CNAE) em relação ao serviço ou fornecimento de material alusivo à respectiva cotação. Além disso, a Entidade se responsabilizará pela veracidade dos documentos apresentados referentes às pesquisas de preços junto aos fornecedores.\n\n',
                    'Por ser expressão da verdade, firmo a presente declaração.'
                ],
                alignment: 'justify',
                fontSize: 12,
                margin: [0, 20, 0, 10]
            },
            {
                text: `${municipio}/${uf}, na data da assinatura digital.`,
                alignment: 'left',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            {
                text: `${cargoDirigente}\n\n`,
                alignment: 'center',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            { text: '', pageBreak: 'after' },

            // Declaração Art. 299 Código Penal e Autonomia Financeira
            {
                text: 'DECLARAÇÃO ART. 299 CÓDIGO PENAL E AUTONOMIA FINANCEIRA',
                style: 'header',
                alignment: 'center',
                margin: [0, 120, 0, 2]
            },
            {
                text: [
                    `A ${entidade}, pessoa jurídica de direito privado na forma de associação sem fins lucrativos, com sede na ${endereco}, inscrita no CNPJ nº ${cnpj}, neste ato representada por ${dirigente}, CPF nº ${cpf}, declara para fins de cadastramento de celebração do presente Termo de Fomento junto ao Ministério do Esporte - MESP que a ${entidade} `,
                    { text: 'é uma entidade viável e autônoma financeiramente, e que, de acordo com as demonstrações contábeis regularmente escrituradas, sob pena do Art. 299 do Código Penal:\n\n', bold: true },
                    { text: '1. Compromete-se em manter a escrituração completa de suas receitas e despesas em livros revestidos das formalidades que assegurem a respectiva exatidão, de acordo com a legislação e normas editadas pelo Conselho Federal de Contabilidade;\n\n', bold: true },
                    { text: '2. Compromete-se a conservar em boa ordem, pelo prazo de cinco anos, contado da data da emissão, os documentos que comprovem a origem de suas receitas e a efetivação de suas despesas, bem como a realização de quaisquer outros atos ou operações que venham modificar a sua situação patrimonial;\n\n', bold: true },
                    { text: '3. Apresentar à Secretaria da Receita Federal do Brasil, anualmente, Declaração de Rendimentos, em conformidade com o disposto em ato daquele órgão, sem prejuízo da exigência de apresentação da cópia do respectivo recibo de entrega da referida Declaração de Rendimentos.\n\n', bold: true },
                ],
                alignment: 'justify',
                fontSize: 12,
                margin: [0, 20, 0, 10]
            },
            {
                text: `${municipio}/${uf}, na data da assinatura digital.`,
                alignment: 'left',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            {
                text: `${cargoDirigente}\n\n`,
                alignment: 'center',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            { text: '', pageBreak: 'after' },

            // Declaração de Não Ocorrência de Impedimentos
            {
                text: 'DECLARAÇÃO DE NÃO OCORRÊNCIA DE IMPEDIMENTOS',
                style: 'header',
                alignment: 'center',
                margin: [0, 120, 0, 2]
            },
            {
                text: [
                    `Eu, ${dirigente}, CPF nº ${cpf}, na condição de representante legal da ${entidade}, CNPJ nº ${cnpj}, `,
                    { text: 'DECLARO ', bold: true },
                    `para os devidos fins, nos termos do art. 26, caput, inciso IX, do Decreto nº 8.726 de 2016, que `,
                    { text: 'a presente Entidade e seus dirigentes ', bold: true },
                    `não incorrem em quaisquer das vedações previstas no art. 39 da Lei nº 13.019 de 2014. Nesse sentido:\n\n`,
                    { text: '1. Está regularmente constituída ou, se estrangeira, está autorizada a funcionar no território nacional;\n', bold: true },
                    { text: '2. Não está omissa no dever de prestar contas de parceria anteriormente celebrada; e\n', bold: true },
                    { text: '3. Não teve contas de parceria julgadas irregulares ou rejeitadas por Tribunal ou Conselho de Contas de qualquer esfera da Federação, em decisão irrecorrível, nos últimos 8 (oito) anos.\n\n', bold: true },
                    'Por ser expressão da verdade, firmo a presente declaração.'
                ],
                alignment: 'justify',
                fontSize: 12,
                margin: [0, 20, 0, 10]
            },
            {
                text: `${municipio}/${uf}, na data da assinatura digital.`,
                alignment: 'left',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            {
                text: `${cargoDirigente}\n\n`,
                alignment: 'center',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            { text: '', pageBreak: 'after' },

            // Declaração de Não Receber Recursos para a Mesma Finalidade
            {
                text: 'DECLARAÇÃO',
                style: 'header',
                alignment: 'center',
                margin: [0, 150, 0, 2]
            },
            {
                text: 'NÃO RECEBE RECURSOS PARA A MESMA FINALIDADE DE OUTRA ENTIDADE OU ÓRGÃO',
                style: 'header',
                alignment: 'center',
                margin: [0, 0, 0, 2]
            },
            {
                text: [
                    `Eu, ${dirigente}, CPF nº ${cpf}, na condição de representante legal da ${entidade}, CNPJ nº ${cnpj}, `,
                    { text: 'DECLARO ', bold: true },
                    `ao Ministério do Esporte - MESP, que a entidade a qual represento, apresentou informações para apreciação `,
                    { text: 'SOMENTE ', bold: true },
                    `junto a esse órgão e em nenhum outro ente da administração pública, bem como não recebe recursos financeiros de outra entidade ou órgão `,
                    { text: '(incluindo a Lei de Incentivo ao Esporte, a Lei Agnelo-Piva e/ou patrocínio de empresas estatais)', bold: true },
                    ` para a mesma finalidade na execução das ações apresentadas e especificadas na Proposta N° ${proposta}, cadastrada no Sistema Eletrônico Transferegov, evitando desta forma a sobreposição de recursos.\n\n`
                ],
                alignment: 'justify',
                fontSize: 12,
                margin: [0, 20, 0, 10]
            },
            {
                text: `${municipio}/${uf}, na data da assinatura digital.`,
                alignment: 'left',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            {
                text: `${cargoDirigente}\n\n`,
                alignment: 'center',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            { text: '', pageBreak: 'after' },

            // Declaração de Comprovação de Existência, Experiência, Instalações
            {
                text: 'DECLARAÇÃO DE COMPROVAÇÃO DE EXISTÊNCIA,',
                style: 'header',
                alignment: 'center',
                margin: [0, 120, 0, 2]
            },
            {
                text: 'EXPERIÊNCIA, INSTALAÇÕES E OUTRAS CONDIÇÕES MATERIAIS',
                style: 'header',
                alignment: 'center',
                margin: [0, 0, 0, 2]
            },
            {
                text: [
                    `Eu, ${dirigente}, CPF nº ${cpf}, na condição de representante legal da ${entidade}, CNPJ nº ${cnpj}, `,
                    { text: 'ATESTO ', bold: true },
                    `que a presente entidade, existe há, no mínimo, 3 (três) anos e possui o cadastro ativo, bem como experiência prévia na realização, com efetividade, no desenvolvimento de Projetos e/ou Eventos de objeto de natureza semelhante, assim como, instalações, condições materiais e capacidade técnica e operacional para o desenvolvimento do objeto apresentado na Proposta nº ${proposta}/2024 e para o cumprimento das metas estabelecidas, em atendimento aos dispostos no art.90, inciso XI, da Lei n° 14.791/2023 (LDO 2024), no art.33, inciso V, da Lei n° 13.019/2014 e no art.26, incisos I, II e III, do Decreto n°8.726/2016 ou outras condições materiais para contratar ou adquirir com recursos da parceria, em conformidade com o art.26, inciso X, do Decreto n°8.726/2016.\n\n`
                ],
                alignment: 'justify',
                fontSize: 12,
                margin: [0, 20, 0, 10]
            },
            {
                text: `${municipio}/${uf}, na data da assinatura digital.`,
                alignment: 'left',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            {
                text: `${cargoDirigente}\n\n`,
                alignment: 'center',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            { text: '', pageBreak: 'after' },

            // Declaração de Compromisso
            {
                text: 'DECLARAÇÃO DE COMPROMISSO',
                style: 'header',
                alignment: 'center',
                margin: [0, 120, 0, 2]
            },
            {
                text: [
                    `Eu, ${dirigente}, CPF nº ${cpf}, na condição de representante legal do(a) ${entidade}, CNPJ nº ${cnpj}, declaro o compromisso de:\n\n`,
                    `• Dispor dos recursos informatizados necessários ao acesso ao Sistema Eletrônico Transferegov, com o objetivo de alimentar, atualizar e acompanhar de forma permanente o referido sistema, de acordo com a norma vigente, durante todo o período da formalização da parceria até a prestação de contas final;\n`,
                    `• Dar publicidade ao Projeto/Programa, durante toda a execução, em observância à aplicação dos selos e marcas, adotadas pelo Ministério do Esporte - MESP e Governo Federal, de acordo com o estipulado no Manual de selos e marcas do Governo Federal, inclusive, em ações de Patrocínio;\n`,
                    `• Previamente à confecção dos materiais, encaminhar para aprovação os layouts, juntamente com o número do instrumento, processo e nome do programa/projeto/evento, para o e-mail: publicidade.cgce@esporte.gov.br.\n\n`,
                    `Por ser expressão da verdade, firmo a presente declaração.`
                ],
                alignment: 'justify',
                fontSize: 12,
                margin: [0, 20, 0, 10]
            },
            {
                text: `${municipio}/${uf}, na data da assinatura digital.`,
                alignment: 'left',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            {
                text: `${cargoDirigente}\n\n`,
                alignment: 'center',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            { text: '', pageBreak: 'after' },

            // Declaração de Custos
            {
                text: 'DECLARAÇÃO DE CUSTOS',
                style: 'header',
                alignment: 'center',
                margin: [0, 120, 0, 2]
            },
            {
                text: [
                    `Eu, ${dirigente}, CPF nº ${cpf}, na condição de representante legal do(a) ${entidade}, CNPJ nº ${cnpj}, `,
                    { text: 'ATESTO ', bold: true },
                    `a planilha de custos, bem como as cotações obtidas, conforme o art. 25, § 1º do Decreto n.º 8.726, de 27 de abril de 2016, inseridas no Sistema Eletrônico Transferegov, Proposta n.º ${proposta}.\n\n`,
                    { text: 'DECLARO ', bold: true },
                    `que os custos apresentados estão de acordo com os praticados no mercado.\n\n`,
                    'Por ser expressão da verdade, firmo a presente declaração.'
                ],
                alignment: 'justify',
                fontSize: 12,
                margin: [0, 20, 0, 10]
            },
            {
                text: `${municipio}/${uf}, na data da assinatura digital.`,
                alignment: 'left',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            {
                text: `${cargoDirigente}\n\n`,
                alignment: 'center',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            { text: '', pageBreak: 'after' },

            // Declaração de Adimplência
            {
                text: 'DECLARAÇÃO DE ADIMPLÊNCIA',
                style: 'header',
                alignment: 'center',
                margin: [0, 120, 0, 2]
            },
            {
                text: [
                    `Eu, ${dirigente}, CPF nº ${cpf}, na condição de representante legal do(a) ${entidade}, CNPJ nº ${cnpj}, `,
                    { text: 'DECLARO', bold: true },
                    `, no uso das atribuições que me foram delegadas e sob as penas da lei, que a presente Entidade:\n\n`,
                    { 
                        text: 'Não está inadimplente com a União, inclusive no que tange às contribuições de que tratam os artigos 195 e 239 da Constituição Federal (contribuições dos empregados para a seguridade social, contribuições para o PIS/PASEP e contribuições para o FGTS), com relação a recursos anteriormente recebidos da Administração Pública Federal por meio de convênios, contratos, acordos, ajustes, subvenções sociais, contribuições, auxílios e similares.\n\n', 
                        bold: true   
                    }
                ],
                alignment: 'justify',
                fontSize: 12,
                margin: [0, 20, 0, 10]
            },
            {
                text: `${municipio}/${uf}, na data da assinatura digital.`,
                alignment: 'left',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            {
                text: `${cargoDirigente}\n\n`,
                alignment: 'center',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            {
                text: [
                    '* Aplicável somente aos Municípios com mais de 50.000 habitantes, conforme § 12 do art. 74, da Lei n° 13.473, de 8 de agosto de 2017, alterada pela Lei n° 13.602, de janeiro de 2018',
                ],
                alignment: 'justify',
                fontSize: 9,
                margin: [0, 50, 0, 0],
                color: 'gray'
            },
            { text: '', pageBreak: 'after' },

            // Declaração de Ciência dos Deveres e Responsabilidades Eleitorais
            {
                text: 'DECLARAÇÃO DE CIÊNCIA DOS DEVERES E RESPONSABILIDADES',
                style: 'header',
                alignment: 'center',
                margin: [0, 120, 0, 2]
            },
            {
                text: 'IMPOSTOS PELA LEGISLAÇÃO ELEITORAL',
                style: 'header',
                alignment: 'center',
                margin: [0, 0, 0, 2]
            },
            {
                text: [
                    `Eu, ${dirigente}, CPF nº ${cpf}, na condição de representante legal da ${entidade}, CNPJ nº ${cnpj}, `,
                    { text: 'Declaro', bold: true },
                    `, sob as penas da lei e passível de devolução dos recursos do Termo de Fomento nº ${proposta}:\n\n`,
                    '1. Estar ciente das condutas vedadas aos agentes públicos durante o período do defeso eleitoral, de acordo com disposto no caput do art. 73 da Lei nº 9.504 de 1997;\n',
                    '2. Estar ciente de que as condutas vedadas dispensam comprovação de dolo ou culpa, sendo cláusulas de responsabilidade objetiva;\n',
                    '3. Que a presente Entidade não possui dentro do quadro de dirigentes candidatos ao pleito eleitoral de 2024;\n',
                    `4. Que não será permitido no âmbito do Termo de Fomento nº ${proposta} a distribuição de brindes ou outros bens que possam proporcionar vantagem ao eleitor durante o período de campanha eleitoral;\n`,
                    `5. Que não será permitido o uso promocional em favor de candidatos, partidos políticos ou coligações, na distribuição de bens e serviços de caráter social custeados pelo Termo de Fomento nº ${proposta};\n`,
                    '6. Que não será permitida qualquer promoção pessoal ou condutas que afetem a igualdade de oportunidades entre candidatos nos pleitos eleitorais;\n',
                    '7. Que não será realizada publicidade institucional de atos, programas, obras, serviços e campanhas dos órgãos públicos federais;\n',
                    '8. Estar ciente do inteiro teor da Cartilha de Condutas Vedadas aos Agentes Públicos Federais em Eleições, disponível no site do governo.\n\n',
                    'Por ser expressão da verdade, firmo a presente declaração.'
                ],
                alignment: 'justify',
                fontSize: 12,
                margin: [0, 20, 0, 10]
            },
            {
                text: `${municipio}/${uf}, na data da assinatura digital.`,
                alignment: 'left',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            {
                text: `${cargoDirigente}\n\n`,
                alignment: 'center',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            { text: '', pageBreak: 'after' },

            // Atestado de Veracidade das Informações Prestadas
            {
                text: 'ATESTADO DE VERACIDADE DAS INFORMAÇÕES PRESTADAS',
                style: 'header',
                alignment: 'center',
                margin: [0, 120, 0, 2]
            },
            {
                text: [
                    `Eu, ${dirigente}, CPF nº ${cpf}, na condição de representante legal do(a) ${entidade}, CNPJ nº ${cnpj}, `,
                    'ATESTO que a assinatura eletrônica deste documento garante a integridade e a ciência da responsabilidade de todas as declarações, bem como tenho ciência da responsabilidade sob todos os efeitos das minhas declarações prestadas conforme os documentos apresentados:\n\n',
                    '• Declaração de não utilização de recursos para finalidade alheia ao objeto da parceria;\n',
                    '• Declaração dos arts. 26 e 27 do Decreto nº 8.726 de 2016 e do art. 39 da Lei nº 13.019 de 2014;\n',
                    '• Declaração de ausência de destinação de recursos;\n',
                    '• Declaração de cumprimento do art. 90 da Lei nº 14.791 de 29 de dezembro de 2023;\n',
                    '• Declaração de não contratação com recursos da parceria;\n',
                    '• Declaração do art. 299 do Código Penal e autonomia financeira;\n',
                    '• Declaração da não ocorrência de impedimentos;\n',
                    '• Declaração de que não recebe recursos para a mesma finalidade de outra entidade ou órgão;\n',
                    '• Declaração de comprovação de existência, experiência, instalações e outras condições materiais;\n',
                    '• Declaração de Compromisso;\n',
                    '• Declaração de Custos;\n',
                    '• Declaração de Adimplência;\n',
                    '• Declaração de Ciência dos Deveres e Responsabilidades impostos pela legislação eleitoral;\n\n',
                    { text: 'DECLARO ', bold: true },
                    'para os devidos fins de direito, sob as penas da lei, que as informações prestadas nos documentos mencionados são verdadeiras e autênticas.\n\n',
                    `${municipio}/${uf}, ${date}\n\n`
                ],
                alignment: 'justify',
                fontSize: 12,
                margin: [0, 20, 0, 20]
            },
            {
                text: '\n\n____________________________________\n',
                alignment: 'center',
                fontSize: 12,
                margin: [0, 10, 0, 0]
            },
            {
                text: `${cargoDirigente}\n\n`,
                alignment: 'center',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
        ],
        styles: {
            header: {
                fontSize: 16,
                bold: true,
                color: '#003087'
            },
            subheader: {
                fontSize: 14,
                bold: true,
                color: '#003087'
            }
        },
        permissions: {
            printing: 'highResolution',
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: false,
            documentAssembly: false
        }
    };

    pdfMake.createPdf(docDefinition).download(`Todas_Declaracoes_${dirigente}.pdf`);
}

// Função para gerar o Atestado de Capacidade Técnica
    // Função para gerar o Atestado de Capacidade Técnica
async function generateAtestadoPDF() {
    // Obter dados do formulário
    const formData = {
        dirigente: document.getElementById('dirigente').value,
        cpf: document.getElementById('cpf').value,
        cnpj: document.getElementById('cnpj').value,
        entidade: document.getElementById('entidade').value,
        endereco: document.getElementById('endereco').value,
        proposta: document.getElementById('proposta').value,
        municipio: document.getElementById('municipio').value,
        objeto: document.getElementById('objeto').value,
        uf: document.getElementById('uf').value,
        cargoDirigente: document.getElementById('cargoDirigente').value,
        nomeProjeto: document.getElementById('nomeProjeto').value,
        entidadesParceiras: document.getElementById('entidadesParceiras').value,
        dataInicio: document.getElementById('dataInicio').value,
        dataTermino: document.getElementById('dataTermino').value,
        numeroBeneficiados: document.getElementById('numeroBeneficiados').value,
        atividadesDesenvolvidas: document.getElementById('atividadesDesenvolvidas').value,
        estruturasFisicas: document.getElementById('estruturasFisicas').value,
        qualificacaoPessoal: document.getElementById('qualificacaoPessoal').value
    };

    // Obter arquivos diretamente da tabela de visualização
    const getFilesFromTable = (tableId) => {
        const table = document.getElementById(tableId);
        if (!table || table.classList.contains('hidden')) return [];
        
        const rows = table.querySelectorAll('tbody tr');
        const files = [];
        
        rows.forEach(row => {
            const img = row.querySelector('img');
            const fileName = row.querySelector('td:nth-child(2)').textContent;
            
            if (img) {
                files.push({
                    name: fileName,
                    src: img.src
                });
            }
        });
        
        return files;
    };

    // Obter arquivos das tabelas
    const fotos = getFilesFromTable('fotoTable');
    const materiais = getFilesFromTable('materiaisTable');
    const midias = getFilesFromTable('midiaTable');

    // Processar arquivos (convertendo para Base64)
    const processFiles = async (files) => {
        const results = [];
        
        for (const file of files) {
            try {
                // Se já é uma URL de dados (data:), usar diretamente
                if (file.src.startsWith('data:')) {
                    results.push({
                        name: file.name,
                        base64: file.src,
                        preview: {
                            image: file.src,
                            width: 200,
                            height: 150,
                            margin: [0, 5, 0, 10]
                        }
                    });
                } else {
                    // Se for uma blob URL, converter para Base64
                    const response = await fetch(file.src);
                    const blob = await response.blob();
                    const base64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                    
                    results.push({
                        name: file.name,
                        base64: base64,
                        preview: {
                            image: base64,
                            width: 200,
                            height: 150,
                            margin: [0, 5, 0, 10]
                        }
                    });
                }
            } catch (error) {
                console.error(`Erro ao processar arquivo ${file.name}:`, error);
            }
        }
        
        return results;
    };

    // Processar todos os arquivos
    const [fotosProcessadas, materiaisProcessados, midiasProcessadas] = await Promise.all([
        processFiles(fotos),
        processFiles(materiais),
        processFiles(midias)
    ]);

    // Processar instrumentos (apenas nomes)
    const instrumentosList = Array.from(document.getElementById('instrumentos').files)
        .map(file => file.name).join(', ') || 'Nenhum arquivo enviado';

    // Carregar marca d'água
    const watermarkImage = await getBase64Image('../images/Declarações _page-0001.jpg');

    // Função para criar seção de arquivos no PDF
    const createFileSection = (title, files, sectionLetter) => {
        const sectionContent = [];
        
        sectionContent.push({
            text: `${sectionLetter}) ${title}:`,
            bold: true,
            fontSize: 12,
            margin: [0, 5, 0, 5]
        });

        if (files.length > 0) {
            files.forEach((file, index) => {
                sectionContent.push({
                    text: `${title.slice(0, -1)} ${index + 1} - ${file.name}`,
                    fontSize: 10,
                    margin: [0, 2, 0, 2]
                });
                sectionContent.push(file.preview);
            });
        } else {
            sectionContent.push({
                text: `Nenhum arquivo enviado`,
                fontSize: 12,
                margin: [0, 0, 0, 10]
            });
        }

        return sectionContent;
    };

    // Construir conteúdo do PDF
    const content = [
        // Cabeçalho
        {
            text: 'ATESTADO DE CAPACIDADE TÉCNICA',
            style: 'header',
            alignment: 'center',
            margin: [0, 120, 0, 2]
        },
        // Corpo do documento
        {
            text: [
                `Eu, ${formData.dirigente}, CPF Nº ${formData.cpf}, ATESTO para fins de formalização de Termo de Fomento no âmbito do Ministério do Esporte - MESP que o(a) ${formData.entidade}, inscrito(a) no CNPJ sob o nº ${formData.cnpj}, situado(a) no(a) ${formData.endereco}, possui capacidade técnica e operacional para executar o objeto apresentado na Proposta nº ${formData.proposta}/2024 em atendimento ao art. 33 inciso V da Lei 13.019 de 2014 e art. 90 inciso XI da Lei nº 14.791 de 29 de dezembro de 2023 (LDO 2024), considerando as experiências adquiridas na execução de projeto(s)/ação(es) na(s) área(s) esportivo/educacional/social, bem como qualificação profissional do seu quadro pessoal e comprovação que dispõe de estruturas físicas conforme anexo.\n\n`,
                'O(s) projeto(s)/ação(es) descrito(s) foi(ram) executado(s) com qualidade, não existindo até a presente data fatos que desabonem a conduta e a responsabilidade da entidade com as obrigações assumidas, confirmando assim a capacidade técnica e operacional para a execução do que foi proposto.\n\n\n'
            ],
            alignment: 'justify',
            fontSize: 12,
            margin: [0, 40, 0, 20]
        },
        // Rodapé
        {
            text: `${formData.municipio}/${formData.uf}, na data da assinatura digital.`,
            alignment: 'left',
            fontSize: 12,
            margin: [0, 0, 0, 20]
        },
        {
            text: '\n\n____________________________________\n',
            alignment: 'center',
            fontSize: 12,
            margin: [0, 10, 0, 0]
        },
        {
            text: `${formData.cargoDirigente}\n\n`,
            alignment: 'center',
            fontSize: 12,
            margin: [0, 0, 0, 20]
        },
        { text: '', pageBreak: 'after' },
        // Anexo - Histórico
        {
            text: 'ANEXO - HISTÓRICO',
            style: 'header',
            alignment: 'center',
            margin: [0, 20, 0, 20]
        },
        {
            text: [
                { text: 'I. Apresentação:\n\n', bold: true },
                { text: 'Nome do Projeto/Ação: ', bold: true }, `${formData.nomeProjeto}\n\n`,
                { text: 'Entidades Parceiras: ', bold: true }, `${formData.entidadesParceiras}\n\n`,
                { text: 'Data de Início e Término da Execução: ', bold: true }, `${formData.dataInicio} a ${formData.dataTermino}\n`,
                '(Comprovantes de experiência prévia na realização do objeto da parceria ou de objeto de natureza semelhante de no mínimo um ano de capacidade técnica e operacional.)\n\n',
                { text: 'Número de Beneficiados: ', bold: true }, `${formData.numeroBeneficiados}\n\n`,
                { text: 'Ações/Atividades Desenvolvidas: ', bold: true }, `${formData.atividadesDesenvolvidas}\n`,
                '(Descrição das atividades desenvolvidas, recursos humanos envolvidos, objetivo geral e resultados alcançados)\n\n',
                { text: 'Estruturas Físicas Utilizadas: ', bold: true }, `${formData.estruturasFisicas}\n\n`,
                { text: 'Qualificação Profissional do Quadro Pessoal: ', bold: true }, `${formData.qualificacaoPessoal}\n\n`,
                { text: 'Documentos Comprobatórios Encaminhados em Anexo:\n', bold: true },
            ],
            alignment: 'justify',
            fontSize: 12,
            margin: [0, 0, 0, 20]
        },
        // Seções de arquivos
        ...createFileSection('Fotos', fotosProcessadas, 'a'),
        ...createFileSection('Materiais de Divulgação', materiaisProcessados, 'b'),
        ...createFileSection('Matérias na Mídia', midiasProcessadas, 'c'),
        // Instrumentos
        { 
            text: 'd) Instrumentos Específicos:', 
            bold: true, 
            fontSize: 12, 
            margin: [0, 5, 0, 5] 
        },
        { 
            text: instrumentosList, 
            fontSize: 12, 
            margin: [0, 0, 0, 20] 
        }
    ];

    // Criar definição do PDF
    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        background: watermarkImage ? [{
            image: watermarkImage,
            width: 595,
            height: 842,
            absolutePosition: { x: 0, y: 0 },
            opacity: 0.9
        }] : undefined,
        content: content,
        styles: {
            header: {
                fontSize: 16,
                bold: true,
                color: '#003087'
            },
            subheader: {
                fontSize: 14,
                bold: true,
                color: '#003087'
            }
        },
        permissions: {
            printing: 'highResolution',
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: false,
            documentAssembly: false
        }
    };

    // Gerar e baixar o PDF
    pdfMake.createPdf(docDefinition).download(`Atestado_Capacidade_Tecnica_${formData.dirigente}.pdf`);
}
// Função para gerar o Termo de Compromisso Coordenador
async function generateTermoCompromissoCoordenadorPDF() {
    const coordenador = document.getElementById('nomeCoordenador').value;
    const cpfCoordenador = document.getElementById('cpfCoordenador').value;
    const rgCoordenador = document.getElementById('rgCoordenador').value;

    if (!coordenador || !cpfCoordenador || !rgCoordenador) {
        console.log("Campos do Coordenador não foram preenchidos. PDF não gerado.");
        return;
    }

    const dirigente = document.getElementById('dirigente').value;
    const cpfDirigente = document.getElementById('cpf').value;
    const entidade = document.getElementById('entidade').value;
    const cnpjEntidade = document.getElementById('cnpj').value;
    const nomePrograma = document.getElementById('nomePrograma').value;
    const municipio = document.getElementById('municipio').value;
    const uf = document.getElementById('uf').value;
    const cargoDirigente = document.getElementById('cargoDirigente').value;

    const watermarkImage = await getBase64Image('../images/Declarações _page-0001.jpg');

    var docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        background: watermarkImage ? [{
            image: watermarkImage,
            width: 595,
            height: 842,
            absolutePosition: { x: 0, y: 0 },
            opacity: 0.9
        }] : undefined,
        content: [
            {
                text: 'TERMO DE COMPROMISSO',
                style: 'header',
                alignment: 'center',
                margin: [0, 130, 0, 20]
            },
            {
                text: [
                    `Eu, ${dirigente}, CPF nº ${cpfDirigente}, na condição de representante legal do(a) ${entidade}, inscrito(a) no CNPJ sob o nº ${cnpjEntidade}, indico para a atribuição de Coordenador Geral do Programa ${nomePrograma} o servidor ${coordenador}, RG nº ${rgCoordenador}, CPF nº ${cpfCoordenador}, vinculado à esta Entidade como Coordenador Geral, possuindo a qualificação exigida para o desenvolvimento do Programa ${nomePrograma}, devidamente comprovada, com dedicação de 40 horas semanais junto ao Programa.\n\n`
                ],
                alignment: 'justify',
                fontSize: 12,
                margin: [0, 0, 0, 40]
            },
            {
                text: `${municipio}/${uf}, na data da assinatura digital.`,
                alignment: 'left',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
            {
                text: '\n\n____________________________________\n',
                alignment: 'center',
                fontSize: 12,
                margin: [0, 10, 0, 0]
            },
            {
                text: `${cargoDirigente}\n\n`,
                alignment: 'center',
                fontSize: 12,
                margin: [0, 0, 0, 20]
            },
        ],
        styles: {
            header: {
                fontSize: 16,
                bold: true
            }
        },
        permissions: {
            printing: 'highResolution',
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: false,
            documentAssembly: false
        }
    };

    pdfMake.createPdf(docDefinition).download(`Termo_Compromisso_${coordenador}.pdf`);
}