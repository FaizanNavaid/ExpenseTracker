import HTTPProvider from "./HttpProvider";

class ApiServiceClass {
  async postFromAPI(
    endpoint: string,
    data: any = {},
    token: string = "",
    extraConfig: any = {},
  ): Promise<any> {
    try {
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(extraConfig.headers || {}),
      };

      const response = await HTTPProvider.post(endpoint, data, {
        ...extraConfig,
        headers,
      });

      if (endpoint.includes("login") || endpoint.includes("signup")) {
        return { data: response.data, headers: response.headers };
      }

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async getFromAPI(endpoint: string, token: string = ""): Promise<any> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await HTTPProvider.get(endpoint, { headers });
      return response.data;
    } catch (error: any) {
      console.log("getFromAPI Error:", error?.response?.data || error.message);
      throw error;
    }
  }

  async patchFromAPI(
    endpoint: string,
    data: any = {},
    token: string = "",
    extraConfig: any = {},
  ): Promise<any> {
    try {
      const isFormData = data instanceof FormData;

      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
        ...(extraConfig.headers || {}),
      };

      const response = await HTTPProvider.patch(endpoint, data, {
        ...extraConfig,
        headers,
      });

      return response.data;
    } catch (error: any) {
      console.log("patchFromAPI Error:", error?.response?.data || error.message);
      throw error;
    }
  }

  async putToAPI(
    endpoint: string,
    data: any = {},
    token: string = "",
  ): Promise<any> {
    try {
      const isFormData = data instanceof FormData;
      const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
      const config: any = { headers };

      if (isFormData) {
        config.headers = { ...headers, "Content-Type": "multipart/form-data" };
      }

      const response = await HTTPProvider.put(endpoint, data, config);
      return response.data;
    } catch (error: any) {
      console.log("putToAPI Error:", error?.response?.data || error.message);
      throw error;
    }
  }

  async deleteFromAPI(endpoint: string, data?: any): Promise<any> {
    try {
      const response = await HTTPProvider.delete(endpoint, { data });
      return response.data;
    } catch (error: any) {
      console.log("deleteFromAPI Error:", error?.response?.data || error.message);
      throw error;
    }
  }
}

const ApiService = new ApiServiceClass();
export default ApiService;