import server from "@/core/libs/server.mjs";
import CONST from "@/core/CONST.mjs";

server.listen(CONST.PORT, () => {
  console.log("Server is ready!");
});
