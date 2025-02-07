// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QuestionAnswer is Ownable {
    struct Question {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        uint256[] answerIds;
    }

    struct Answer {
        uint256 id;
        uint256 questionId;
        address author;
        string content;
        uint256 upvotes;
    }

    IERC20 public oykToken = IERC20(0x3E4EF6dfc4565B92C4a4e60897079925E85A615E);
    uint256 public constant UPVOTE_FEE = 10 * 10**18; // 10 OYK

    uint256 private questionCounter;
    uint256 private answerCounter;
    
    mapping(uint256 => Question) public questions;
    mapping(uint256 => Answer) public answers;
    mapping(address => mapping(uint256 => bool)) public hasUpvoted;

    event QuestionCreated(uint256 indexed questionId, address indexed author, string content);
    event AnswerCreated(uint256 indexed answerId, uint256 indexed questionId, address indexed author, string content);
    event AnswerUpvoted(uint256 indexed answerId, address indexed voter);

    constructor(address initialOwner) Ownable(initialOwner) {}

    modifier validContent(string memory _content) {
        require(bytes(_content).length > 0, "Content cannot be empty");
        _;
    }

    modifier questionExists(uint256 _questionId) {
        require(_questionId < questionCounter, "Question does not exist");
        _;
    }

    modifier answerExists(uint256 _answerId) {
        require(_answerId < answerCounter, "Answer does not exist");
        _;
    }

    modifier correctUpvoteFee() {
        require(msg.value == UPVOTE_FEE, "Incorrect upvote fee");
        _;
    }

    modifier notUpvoted(uint256 _answerId) {
        require(!hasUpvoted[msg.sender][_answerId], "Already upvoted this answer");
        _;
    }

    function createQuestion(string memory _content) public validContent(_content) {
        uint256[] memory emptyArray = new uint256[](0);
        questions[questionCounter] = Question({
            id: questionCounter,
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp,
            answerIds: emptyArray
        });

        emit QuestionCreated(questionCounter, msg.sender, _content);
        questionCounter++;
    }

    function createAnswer(uint256 _questionId, string memory _content) public questionExists(_questionId) validContent(_content) {
        answers[answerCounter] = Answer({
            id: answerCounter,
            questionId: _questionId,
            author: msg.sender,
            content: _content,
            upvotes: 0
        });

        questions[_questionId].answerIds.push(answerCounter);

        emit AnswerCreated(answerCounter, _questionId, msg.sender, _content);
        answerCounter++;
    }

   function upvoteAnswer(uint256 _answerId) public answerExists(_answerId) notUpvoted(_answerId) {
       Answer storage answer = answers[_answerId];
       
       // Transfer tokens from user
       require(oykToken.transferFrom(msg.sender, address(this), UPVOTE_FEE), "Token transfer failed");
       
       // Calculate splits
       uint256 authorPayment = (UPVOTE_FEE * 80) / 100; // 80% to author
       
       // Transfer to author
       require(oykToken.transfer(answer.author, authorPayment), "Author payment failed");
       // 20% stays in contract as fee

       answer.upvotes++;
       hasUpvoted[msg.sender][_answerId] = true;

       emit AnswerUpvoted(_answerId, msg.sender);
   }

    function getQuestions() public view returns (Question[] memory) {
        Question[] memory allQuestions = new Question[](questionCounter);
        for (uint256 i = 0; i < questionCounter; i++) {
            allQuestions[i] = questions[i];
        }
        return allQuestions;
    }

    function getAnswersForQuestion(uint256 _questionId) public view questionExists(_questionId) returns (Answer[] memory) {
        uint256[] memory answerIds = questions[_questionId].answerIds;
        Answer[] memory questionAnswers = new Answer[](answerIds.length);
        
        for (uint256 i = 0; i < answerIds.length; i++) {
            questionAnswers[i] = answers[answerIds[i]];
        }
        
        return questionAnswers;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getContractTokenBalance() public view returns (uint256) {
       return oykToken.balanceOf(address(this));
    }

    function withdrawTokens(address _to) public {
       // Add owner check etc.
       uint256 balance = oykToken.balanceOf(address(this));
       require(oykToken.transfer(_to, balance), "Withdrawal failed");
    }

    function withdrawEther() public onlyOwner {
       uint256 balance = address(this).balance;
       require(balance > 0, "No ether to withdraw");
       
       (bool success, ) = payable(owner()).call{value: balance}("");
       require(success, "Withdrawal failed");
   }

    receive() external payable {}
    fallback() external payable {}
}
