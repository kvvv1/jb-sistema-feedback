const express = require('express');
const sql = require('mssql');
const cors = require('cors');

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
            .query(`
                INSERT INTO Feedback
                (SelectedSystems, OtherSystems, SystemsHelpWork, SystemsEasyToUse, GeneralImprovements, AttentionToNeeds, SupportEfficiency, DevelopmentRating, TechnicalFeedback)
                OUTPUT INSERTED.FeedbackId
                VALUES (@SelectedSystems, @OtherSystems, @SystemsHelpWork, @SystemsEasyToUse, @GeneralImprovements, @AttentionToNeeds, @SupportEfficiency, @DevelopmentRating, @TechnicalFeedback)
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

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 