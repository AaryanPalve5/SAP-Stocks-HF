// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FakeNewsReport {
    struct News {
        uint id;
        string headline;
        string url;
        address reporter;
        uint votes;
    }

    uint public newsCount = 0;
    mapping(uint => News) public newsReports;
    mapping(uint => mapping(address => bool)) public hasVoted; // Separate mapping for votes
    mapping(address => uint) public reputation;

    event NewsReported(uint id, string headline, string url, address reporter);
    event NewsVoted(uint id, address voter);

    function reportFakeNews(string memory _headline, string memory _url) public {
        newsCount++;
        newsReports[newsCount] = News(newsCount, _headline, _url, msg.sender, 0);
        reputation[msg.sender] += 1;
        emit NewsReported(newsCount, _headline, _url, msg.sender);
    }

    function voteFakeNews(uint _newsId) public {
        require(newsReports[_newsId].id != 0, "News does not exist");
        require(!hasVoted[_newsId][msg.sender], "Already voted");
        newsReports[_newsId].votes += 1;
        hasVoted[_newsId][msg.sender] = true;
        reputation[msg.sender] += 1;
        emit NewsVoted(_newsId, msg.sender);
    }

    function getNews(uint _newsId) public view returns (uint, string memory, string memory, address, uint) {
        News storage newsItem = newsReports[_newsId];
        return (newsItem.id, newsItem.headline, newsItem.url, newsItem.reporter, newsItem.votes);
    }
}
