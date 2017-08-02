import Inode from "../../fs/ofs/inode.js";
import console from "./index.js";

const inode = new Inode();

// Reading not applicable
inode.read = () => console.read();
// Only writing is allowed
inode.write = data => console.write(data);

export default inode;
