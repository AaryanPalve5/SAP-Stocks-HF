const hre = require("hardhat");

async function main() {
    const FakeNewsReport = await hre.ethers.getContractFactory("FakeNewsReport");
    const fakeNewsReport = await FakeNewsReport.deploy(); // Deploy the contract

    await fakeNewsReport.waitForDeployment(); // Wait for deployment to complete

    console.log("FakeNewsReport deployed to:", await fakeNewsReport.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
