# kafka-judger  


```bash
cd kafka-docker  
docker compose up  
```
콘솔에서 로그를 보며  
토픽 생성이 다 될 때 까지 대기 후  
![1](https://github.com/vcho1958/kafka-judger/blob/main/1.PNG)  
![2](https://github.com/vcho1958/kafka-judger/blob/main/2.PNG)  
```bash
cd ..  
docker compose up  
```
  
콘솔에서 로그를 확인하여 consumer가 파티션에 할당될 때 까지 대기  
  ![1](https://github.com/vcho1958/kafka-judger/blob/main/3.PNG)  
http://localhost:4500 접속  
요청버튼을 눌러 테스트  
  
할당된 카프카 컨슈머 호스트와  
진행률이 실시간으로 출력된다.  

