// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QuestionAnswer is Ownable {
    struct Question {}

    struct Answer {}

    IERC20 public oykToken = IERC20(0x3E4EF6dfc4565B92C4a4e60897079925E85A615E);
    uint256 public constant UPVOTE_FEE = 10 * 10 ** 18; // 10 OYK

    uint256 private questionCounter;
    uint256 private answerCounter;

    mapping(uint256 => Question) public questions;
    mapping(uint256 => Answer) public answers;
    mapping(address => mapping(uint256 => bool)) public hasUpvoted;

    event QuestionCreated(
        uint256 indexed questionId,
        address indexed author,
        string content
    );
    event AnswerCreated(
        uint256 indexed answerId,
        uint256 indexed questionId,
        address indexed author,
        string content
    );
    event AnswerUpvoted(uint256 indexed answerId, address indexed voter);

    constructor(address initialOwner) Ownable(initialOwner) {}

    modifier validContent(string memory _content) {}

    modifier questionExists(uint256 _questionId) {}

    modifier answerExists(uint256 _answerId) {}

    modifier correctUpvoteFee() {}

    modifier notUpvoted(uint256 _answerId) {}

    function createQuestion(
        string memory _content
    ) public validContent(_content) {}

    function createAnswer(
        uint256 _questionId,
        string memory _content
    ) public questionExists(_questionId) validContent(_content) {}

    function upvoteAnswer(
        uint256 _answerId
    ) public answerExists(_answerId) notUpvoted(_answerId) {}

    function getQuestions() public view returns (Question[] memory) {}

    function getAnswersForQuestion(
        uint256 _questionId
    ) public view questionExists(_questionId) returns (Answer[] memory) {}

    function getContractBalance() public view returns (uint256) {}

    function getContractTokenBalance() public view returns (uint256) {}

    function withdrawTokens(address _to) public {}

    function withdrawEther() public onlyOwner {}

    receive() external payable {}
    fallback() external payable {}
}
