const hre = require("hardhat");

async function main() {
  // Mine 29 blocks (we're at block 2, need to get to 31)
  for(let i = 0; i < 29; i++) {
    await hre.network.provider.send("evm_mine");
    process.stdout.write('.');
  }
  console.log('\nMined 29 blocks');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
