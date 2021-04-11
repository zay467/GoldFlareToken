const GoldFlareToken = artifacts.require("GoldFlareToken");
const GoldFlareTokenSale = artifacts.require("GoldFlareTokenSale");

module.exports = function (deployer) {
  deployer.deploy(GoldFlareToken, 1000000).then(function () {
    // 0.001 eth
    var tokenPrice = 1000000000000000;
    return deployer.deploy(
      GoldFlareTokenSale,
      GoldFlareToken.address,
      tokenPrice
    );
  });
};
