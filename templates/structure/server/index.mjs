import server from "@Piglet/libs/server.mjs";
import CONST from "@Piglet/CONST.mjs";

server.listen(CONST.PORT, () => {
  console.log("Server is ready!");
});
