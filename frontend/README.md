# LLM4Workflow

LLM4Workflow is an LLM-based automated workflow model generation tool.

## ✨ Features

🤖  **Automated Model Generation**: automatically generates executable workflow models from natural language-based workflow descriptions.

🔍 **Automated Knowledge Embedding**: besides public APIs, users can also import customer APIs, and LLM4Workflow can automatically embed the knowledge of these APIs into LLM’s contextual environment.

🔄  **Automated Process Refinement**: utilizes LLM chains to decompose complex tasks into multiple subtasks, and efficiently complete the parsing and refinement process.

📊 **Automated Process Evaluation**: users can deploy workflow models to real-world workflow systems such as [EdgeWorkflow](https://github.com/ISEC-AHU/EdgeWorkflow) to evaluate the correctness and the performance of generated workflow models.

## 🎥 Demonstration

For more details, you can watch the [demo video](https://www.youtube.com/watch?v=XRQ0saKkuxY).

## 🛠️ Getting Started

To run LLM4Workflow, follow these steps:

1. Clone this repository:`git clone https://github.com/ISEC-AHU/LLM4Workflow.git LLM4Workflow`

2. Navigate to the backend directory: `cd LLM4Workflow/backend`

3. Set up the Python  environment: `virtualenv venv && venv/bin/activate && poetry install`

4. Start the Postgres server: `docker-compose up`

5. Configure environment variables:

   ```sh
   # Obtain OpenAI API access from https://openai.com/blog/openai-api
   OPENAI_API_KEY=<your-api-key>
   
   # Lang Smith Configuration[Optional]
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_API_KEY=<your-api-key>
   LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
   ```

6. Start the backend server: `langchain serve`

7. Set up the frontend environment: `cd frontend && npm install`

8. Start the frontend (dev) server: `npm run start`

9. Your application should now be up and running in your browser! If you need to change the startup port, you can configure it in the `vite.config.ts` file.
