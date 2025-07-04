import express from 'express';
import sql from 'mssql';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// Configuração do SQL Server
const dbConfig = {
    user: 'sa',
    password: 'jblimpeza2015',
    server: 'srvdb01',
    database: 'SistemaFeedback',
    options: {
        encrypt: false, // true se usar Azure
        trustServerCertificate: true // para ambientes de desenvolvimento
    }
};

// Endpoint para receber feedback
app.post('/api/feedback', async (req, res) => {
    const {
        selectedSystems,
        otherSystems,
        systemsHelpWork,
        systemsEasyToUse,
        generalImprovements,
        attentionToNeeds,
        supportEfficiency,
        developmentRating,
        technicalFeedback,
        systemsEvaluations // array de avaliações por sistema
    } = req.body;

    // Captura do IP do usuário
    const userIP =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      null;

    let pool;
    try {
        pool = await sql.connect(dbConfig);

        // 1. Inserir na tabela Feedback
        const feedbackResult = await pool.request()
            .input('SelectedSystems', sql.NVarChar(300), selectedSystems.join(';'))
            .input('OtherSystems', sql.NVarChar(200), otherSystems)
            .input('SystemsHelpWork', sql.VarChar(20), systemsHelpWork)
            .input('SystemsEasyToUse', sql.VarChar(20), systemsEasyToUse)
            .input('GeneralImprovements', sql.NVarChar(sql.MAX), generalImprovements)
            .input('AttentionToNeeds', sql.VarChar(30), attentionToNeeds)
            .input('SupportEfficiency', sql.VarChar(30), supportEfficiency)
            .input('DevelopmentRating', sql.Int, developmentRating)
            .input('TechnicalFeedback', sql.NVarChar(sql.MAX), technicalFeedback)
            .input('UserIP', sql.VarChar(45), userIP)
            .query(`
                INSERT INTO Feedback
                (SelectedSystems, OtherSystems, SystemsHelpWork, SystemsEasyToUse, GeneralImprovements, AttentionToNeeds, SupportEfficiency, DevelopmentRating, TechnicalFeedback, UserIP)
                OUTPUT INSERTED.FeedbackId
                VALUES (@SelectedSystems, @OtherSystems, @SystemsHelpWork, @SystemsEasyToUse, @GeneralImprovements, @AttentionToNeeds, @SupportEfficiency, @DevelopmentRating, @TechnicalFeedback, @UserIP)
            `);

        const feedbackId = feedbackResult.recordset[0].FeedbackId;

        // 2. Inserir avaliações dos sistemas
        for (const sys of systemsEvaluations) {
            await pool.request()
                .input('FeedbackId', sql.Int, feedbackId)
                .input('SystemName', sql.VarChar(100), sys.systemName)
                .input('Frequency', sql.VarChar(30), sys.frequency)
                .input('Performance', sql.Int, sys.performance)
                .input('Likes', sql.NVarChar(sql.MAX), sys.likes)
                .input('Improvements', sql.NVarChar(sql.MAX), sys.improvements)
                .input('Problems', sql.NVarChar(sql.MAX), sys.problems)
                .query(`
                    INSERT INTO FeedbackSystem
                    (FeedbackId, SystemName, Frequency, Performance, Likes, Improvements, Problems)
                    VALUES (@FeedbackId, @SystemName, @Frequency, @Performance, @Likes, @Improvements, @Problems)
                `);
        }

        res.status(201).json({ success: true, feedbackId });
    } catch (err) {
        console.error('Erro ao salvar feedback:', err);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (pool) pool.close();
    }
});

// Rota de relatório completo dos feedbacks
app.get('/resultadofeedback', async (req, res) => {
    let pool;
    try {
        pool = await sql.connect(dbConfig);
        // Buscar todos os feedbacks
        const feedbacksResult = await pool.request().query('SELECT * FROM Feedback ORDER BY DataEnvio DESC');
        const feedbacks = feedbacksResult.recordset;

        // Buscar todas as avaliações de sistemas
        const systemsResult = await pool.request().query('SELECT * FROM FeedbackSystem');
        const systems = systemsResult.recordset;

        // Montar HTML
        let html = `
        <html>
        <head>
            <title>Relatório de Feedbacks</title>
            <meta charset="utf-8" />
            <style>
                body { font-family: Arial, sans-serif; background: #f4f6fa; margin: 0; padding: 0; }
                .container { max-width: 1100px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #0001; padding: 32px; }
                h1 { color: #1e3a8a; }
                .feedback { border-bottom: 1px solid #e5e7eb; margin-bottom: 32px; padding-bottom: 32px; }
                .feedback:last-child { border-bottom: none; }
                .meta { color: #555; font-size: 0.95em; margin-bottom: 8px; }
                .sistemas { margin-bottom: 12px; }
                .sistema-avaliado { background: #f1f5f9; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px; }
                .campo { margin-bottom: 6px; }
                .campo strong { color: #1e293b; }
                .section-title { color: #2563eb; margin-top: 18px; margin-bottom: 8px; font-size: 1.1em; }
                .chip { display: inline-block; background: #e0e7ef; color: #1e3a8a; border-radius: 6px; padding: 2px 10px; margin-right: 6px; font-size: 0.95em; }
            </style>
        </head>
        <body>
        <div class="container">
        <h1>Relatório de Feedbacks</h1>
        <p>Total de feedbacks: <strong>${feedbacks.length}</strong></p>
        `;

        for (const fb of feedbacks) {
            const sistemasSelecionados = (fb.SelectedSystems || '').split(';').filter(Boolean);
            const sistemasAvaliados = systems.filter(s => s.FeedbackId === fb.FeedbackId);
            html += `
            <div class="feedback">
                <div class="meta">
                    <strong>Enviado em:</strong> ${new Date(fb.DataEnvio).toLocaleString('pt-BR')}<br/>
                    <strong>IP:</strong> ${fb.UserIP || '-'}
                </div>
                <div class="section-title">Sistemas utilizados:</div>
                <div class="sistemas">
                    ${sistemasSelecionados.map(s => `<span class="chip">${s}</span>`).join(' ')}
                    ${fb.OtherSystems ? `<span class="chip" style="background:#fde68a;color:#92400e;">Outros: ${fb.OtherSystems}</span>` : ''}
                </div>
                <div class="section-title">Avaliação por sistema:</div>
                ${sistemasAvaliados.length === 0 ? '<div style="color:#888;">Nenhum sistema avaliado.</div>' : ''}
                ${sistemasAvaliados.map(sys => `
                    <div class="sistema-avaliado">
                        <div class="campo"><strong>Sistema:</strong> ${sys.SystemName}</div>
                        <div class="campo"><strong>Frequência de uso:</strong> ${sys.Frequency}</div>
                        <div class="campo"><strong>Desempenho:</strong> ${'★'.repeat(sys.Performance)}${'☆'.repeat(5-sys.Performance)} (${sys.Performance}/5)</div>
                        <div class="campo"><strong>O que mais gosta:</strong> ${sys.Likes || '-'}</div>
                        <div class="campo"><strong>O que pode melhorar:</strong> ${sys.Improvements || '-'}</div>
                        <div class="campo"><strong>Problemas enfrentados:</strong> ${sys.Problems || '-'}</div>
                    </div>
                `).join('')}
                <div class="section-title">Avaliação geral dos sistemas:</div>
                <div class="campo"><strong>Os sistemas ajudam no trabalho diário?</strong> ${fb.SystemsHelpWork || '-'}</div>
                <div class="campo"><strong>Os sistemas são fáceis de usar?</strong> ${fb.SystemsEasyToUse || '-'}</div>
                <div class="campo"><strong>O que gostaria que fosse criado ou melhorado?</strong> ${fb.GeneralImprovements || '-'}</div>
                <div class="section-title">Sobre o suporte e desenvolvimento técnico:</div>
                <div class="campo"><strong>Atenção às necessidades dos usuários:</strong> ${fb.AttentionToNeeds || '-'}</div>
                <div class="campo"><strong>Eficiência do suporte:</strong> ${fb.SupportEfficiency || '-'}</div>
                <div class="campo"><strong>Avaliação do desenvolvimento/manutenção:</strong> ${'★'.repeat(fb.DevelopmentRating)}${'☆'.repeat(5-fb.DevelopmentRating)} (${fb.DevelopmentRating || 0}/5)</div>
                <div class="campo"><strong>Sugestão/crítica/elogio ao responsável técnico:</strong> ${fb.TechnicalFeedback || '-'}</div>
            </div>
            `;
        }

        html += '</div></body></html>';
        res.send(html);
    } catch (err) {
        res.status(500).send('<h2>Erro ao gerar relatório</h2><pre>' + err.message + '</pre>');
    } finally {
        if (pool) pool.close();
    }
});

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 