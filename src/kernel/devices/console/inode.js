import Inode from "../../fs/ofs/inode.js";
import console from "./index.js";

const inode = new Inode();

inode.read = () => console.read();
inode.write = data => console.write(data);

export default inode;
