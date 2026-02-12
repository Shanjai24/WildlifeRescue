import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ML_API_BASE_URL = process.env.ML_API_URL || 'http://localhost:5000';

/**
 * Client for Wildlife AI/ML Services
 */
class MLClient {
  /**
   * Species Recognition
   */
  static async predictSpecies(imageData) {
    const formData = new FormData();
    formData.append('image', imageData);

    try {
      const response = await axios.post(`${ML_API_BASE_URL}/predict/species`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error in species prediction:', error.message);
      throw error;
    }
  }

  /**
   * Injury Assessment
   */
  static async assessInjury(imageData) {
    const formData = new FormData();
    formData.append('image', imageData);

    try {
      const response = await axios.post(`${ML_API_BASE_URL}/predict/injury`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error in injury assessment:', error.message);
      throw error;
    }
  }

  /**
   * NLP Report Processing
   */
  static async processReport(description) {
    try {
      const response = await axios.post(`${ML_API_BASE_URL}/nlp/process-report`, { description });
      return response.data;
    } catch (error) {
      console.error('Error in report processing:', error.message);
      throw error;
    }
  }

  /**
   * Migration Prediction
   */
  static async predictMigration(species, region, season) {
    try {
      const response = await axios.post(`${ML_API_BASE_URL}/predict/migration`, { species, region, season });
      return response.data;
    } catch (error) {
      console.error('Error in migration prediction:', error.message);
      throw error;
    }
  }

  /**
   * Poaching Hotspots
   */
  static async predictPoachingHotspots(region) {
    try {
      const response = await axios.post(`${ML_API_BASE_URL}/predict/poaching-hotspots`, { region });
      return response.data;
    } catch (error) {
      console.error('Error in poaching prediction:', error.message);
      throw error;
    }
  }

  /**
   * Disease Outbreak Prediction
   */
  static async predictDiseaseOutbreak(species, region, currentCases = 0) {
    try {
      const response = await axios.post(`${ML_API_BASE_URL}/predict/disease-outbreak`, {
        species, region, current_cases: currentCases
      });
      return response.data;
    } catch (error) {
      console.error('Error in disease prediction:', error.message);
      throw error;
    }
  }

  /**
   * Rescuer Assignment Optimization
   */
  static async optimizeAssignment(incident, rescuers) {
    try {
      const response = await axios.post(`${ML_API_BASE_URL}/optimize/assign-rescuer`, {
        incident, rescuers
      });
      return response.data;
    } catch (error) {
      console.error('Error in assignment optimization:', error.message);
      throw error;
    }
  }

  /**
   * Route Optimization for Multiple Incidents
   */
  static async optimizeRoute(startLocation, incidents) {
    try {
      const response = await axios.post(`${ML_API_BASE_URL}/optimize/route`, {
        start_location: startLocation,
        incidents
      });
      return response.data;
    } catch (error) {
      console.error('Error in route optimization:', error.message);
      throw error;
    }
  }

  /**
   * Population Trends
   */
  static async getPopulationTrends(species, region) {
    try {
      const response = await axios.post(`${ML_API_BASE_URL}/analytics/population-trends`, {
        species, region
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching population trends:', error.message);
      throw error;
    }
  }

  /**
   * Impact Report
   */
  static async getImpactReport() {
    try {
      const response = await axios.get(`${ML_API_BASE_URL}/analytics/impact-report`);
      return response.data;
    } catch (error) {
      console.error('Error fetching impact report:', error.message);
      throw error;
    }
  }

  /**
   * Biodiversity Metrics
   */
  static async getBiodiversityMetrics(region, speciesCounts = null) {
    try {
      const response = await axios.post(`${ML_API_BASE_URL}/analytics/biodiversity`, {
        region,
        species_counts: speciesCounts
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching biodiversity metrics:', error.message);
      throw error;
    }
  }
}

export default MLClient;
