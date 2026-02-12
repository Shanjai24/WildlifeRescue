import bcrypt from 'bcryptjs';
import { sequelize, User, Organization, Rescuer, PopulationTrend, BiodiversityMetric, HabitatHealth, PoachingRisk, DiseaseRisk } from '../src/lib/db.js';

async function seedAIData() {
    try {
        console.log('🌱 Starting AI data seeding...');

        // 0. Seed Organizations and Rescuers
        const passwordHash = await bcrypt.hash('password123', 10);

        // Create a test organization near "Sathy" (approx coords: 11.52, 77.24)
        const org1By = await Organization.create({
            name: 'Western Ghats Wildlife Center',
            serviceType: 'wildlife_center',
            city: 'Sathyamangalam',
            district: 'Erode',
            latitude: 11.5034,
            longitude: 77.2444,
            contactPhone: '9876543210',
            contactEmail: 'contact@wgwildlife.org',
            verificationStatus: 'verified'
        });

        const user1By = await User.create({
            email: 'rescuer1@example.com',
            passwordHash,
            role: 'rescuer'
        });

        await Rescuer.create({
            UserId: user1By.id,
            OrganizationId: org1By.id
        });

        console.log('✓ Seeded Organizations and Rescuers');

        // 1. Seed Population Trends
        const speciesList = ['Elephant', 'Rhino', 'Tiger', 'Lion', 'Leopard'];
        const regions = ['Serengeti', 'Kruger', 'Kaziranga', 'Amazon', 'Sundarbans'];

        for (const species of speciesList) {
            for (const region of regions) {
                // Last 6 months
                for (let i = 5; i >= 0; i--) {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    const monthStr = date.toISOString().slice(0, 7);

                    await PopulationTrend.create({
                        species,
                        region,
                        month: monthStr,
                        populationCount: Math.floor(Math.random() * 500) + 100,
                        trendDirection: i === 0 ? 'stable' : (Math.random() > 0.5 ? 'increasing' : 'decreasing')
                    });
                }
            }
        }
        console.log('✓ Seeded Population Trends');

        // 2. Seed Biodiversity Metrics
        for (const region of regions) {
            await BiodiversityMetric.create({
                region,
                shannonIndex: (Math.random() * 1.5 + 2.0).toFixed(4),
                simpsonIndex: (Math.random() * 0.3 + 0.6).toFixed(4),
                speciesRichness: Math.floor(Math.random() * 100) + 50,
                totalIndividuals: Math.floor(Math.random() * 5000) + 1000
            });
        }
        console.log('✓ Seeded Biodiversity Metrics');

        // 3. Seed Habitat Health
        for (const region of regions) {
            await HabitatHealth.create({
                region,
                healthScore: (Math.random() * 30 + 65).toFixed(2),
                forestCoverPercent: (Math.random() * 20 + 70).toFixed(2),
                waterQualityStatus: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)],
                airQualityStatus: ['Excellent', 'Good'][Math.floor(Math.random() * 2)],
                encroachmentLevel: ['Low', 'Moderate'][Math.floor(Math.random() * 2)]
            });
        }
        console.log('✓ Seeded Habitat Health');

        // 4. Seed Poaching Risks
        for (const region of regions) {
            const riskScore = Math.random();
            await PoachingRisk.create({
                region,
                riskScore: riskScore.toFixed(4),
                riskLevel: riskScore > 0.7 ? 'high' : (riskScore > 0.4 ? 'medium' : 'low'),
                predictedIncidents: Math.floor(riskScore * 10),
                recommendations: ['Increase patrols', 'Deploy camera traps', 'Satellite monitoring'],
                forecastRange: 'next_30_days'
            });
        }
        console.log('✓ Seeded Poaching Risks');

        // 5. Seed Disease Risks
        for (const species of speciesList) {
            for (const region of regions) {
                const prob = Math.random();
                await DiseaseRisk.create({
                    species,
                    region,
                    outbreakProbability: prob.toFixed(4),
                    alertLevel: prob > 0.8 ? 'high' : (prob > 0.5 ? 'elevated' : 'normal'),
                    predictedCases30d: Math.floor(prob * 50),
                    preventiveMeasures: ['Vaccination program', 'Isolation', 'Water testing']
                });
            }
        }
        console.log('✓ Seeded Disease Risks');

        console.log('✨ AI Data Seeding Completed Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding AI data:', error);
        process.exit(1);
    }
}

seedAIData();
