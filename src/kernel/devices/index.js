import OFS from "../fs/ofs/index.js";
import console from "./console/inode.js";

const devices = new OFS();

devices.addInode(["console"], console);

export default devices;
