import Inode from "../../fs/ofs/inode.js";
import console from "./index.js";

const inode = new Inode();

inode.read = () => console.read();
// Add a carriage-return to each line-feed, for the terminal emulator
inode.write = data => console.write(data.replace(/\n/g, "\r\n"));

export default inode;
