import server from "@Piglet/libs/server";
import CONST from "@Piglet/misc/CONST";

server.listen(CONST.PORT, () => {
  console.log("Server is ready!");
});
