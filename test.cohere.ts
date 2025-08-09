import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: "4FswEtSBtS9z7cNhPFCmq01yzgfomo38run8VYug"
});

async function test() {
  const out: any = await cohere.generate({
    model: "command",
    prompt: "Dame una sesión de aprendizaje para matemática 4to de secundaria",
    maxTokens: 1000,
    temperature: 0.3,
  });

  console.log(out.generations[0].text);
}

test();
