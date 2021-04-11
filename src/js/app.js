App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  loading: false,
  tokenPrice: 0,
  tokensSold: 0,
  tokenAvailable: 0,

  init: function () {
    console.log("App initialized");
    return App.initWeb3();
  },

  initWeb3: function () {
    // For old metamask version - always expose

    // if (typeof web3 !== undefined) {
    //   App.web3Provider = web3.currentProvider;
    //   web3 = new Web3(web3.currentProvider);
    // } else {
    //   App.web3Provider = new Web3.providers.HttpProvider(
    //     "http://localhost:8545"
    //   );
    //   web3 = new Web3(App.web3Provider);
    // }

    // For new metamask version - need permission to access

    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      //getting Permission to access. This is for when the user has new MetaMask
      window.ethereum.enable();
      App.web3Provider = window.ethereum;
      web3 = new Web3(window.ethereum);
    } else if (
      typeof window !== "undefined" &&
      typeof window.web3 !== "undefined"
    ) {
      web3 = new Web3(window.web3.currentProvider);
      // Acccounts always exposed. This is those who have old version of MetaMask
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:8545"
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },
  initContracts: function () {
    $.getJSON("GoldFlareTokenSale.json", function (goldFlareTokenSale) {
      App.contracts.GoldFlareTokenSale = TruffleContract(goldFlareTokenSale);
      App.contracts.GoldFlareTokenSale.setProvider(App.web3Provider);
      App.contracts.GoldFlareTokenSale.deployed().then(function (
        goldFlareTokenSale
      ) {
        console.log("Address Sale", goldFlareTokenSale.address);
      });
    }).done(function () {
      $.getJSON("GoldFlareToken.json", function (goldFlareToken) {
        App.contracts.GoldFlareToken = TruffleContract(goldFlareToken);
        App.contracts.GoldFlareToken.setProvider(App.web3Provider);
        App.contracts.GoldFlareToken.deployed().then(function (goldFlareToken) {
          console.log("Address", goldFlareToken.address);
        });
        App.listenForEvents();
        return App.render();
      });
    });
  },

  listenForEvents: function () {
    App.contracts.GoldFlareTokenSale.deployed().then(function (instance) {
      instance
        .Sell(
          {},
          {
            fromBlock: 0,
            toBlock: "latest",
          }
        )
        .watch(function (error, event) {
          console.log("Event trigger");
          App.render();
        });
    });
  },
  render: function () {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });
    App.contracts.GoldFlareTokenSale.deployed()
      .then(function (instance) {
        goldFlareTokenSaleInstance = instance;
        return goldFlareTokenSaleInstance.tokenPrice();
      })
      .then(function (tokenPrice) {
        App.tokenPrice = tokenPrice;
        $(".token-price").html(
          web3.fromWei(App.tokenPrice, "ether").toNumber()
        );

        return App.contracts.GoldFlareToken.deployed();
      })
      .then(function (instance) {
        return instance.balanceOf(goldFlareTokenSaleInstance.address);
      })
      .then(function (tokenAvailable) {
        App.tokenAvailable = tokenAvailable.toNumber();

        return goldFlareTokenSaleInstance.tokensSold();
      })
      .then(function (tokensSold) {
        App.tokensSold = tokensSold.toNumber();
        $(".tokens-sold").html(tokensSold.toNumber());
        $(".token-available").html(App.tokenAvailable + App.tokensSold);
        var progressPercent = (App.tokensSold / App.tokenAvailable) * 100;
        $("#progress").css("width", progressPercent + "%");

        App.contracts.GoldFlareToken.deployed()
          .then(function (instance) {
            goldFlareTokenSale = instance;
            return goldFlareTokenSale.balanceOf(App.account);
          })
          .then(function (balance) {
            $(".goldflare-balance").html(balance.toNumber());
            App.loading = false;
            loader.hide();
            content.show();
          });
      });
  },

  buyTokens: function () {
    $("#content").hide();
    $("#loader").show();
    var numberOfTokens = $("#numberOfToken").val();
    App.contracts.GoldFlareTokenSale.deployed()
      .then(function (instance) {
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000,
        });
      })
      .then(function (result) {
        console.log("Tokens bought!");
        $("form").trigger("reset");
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
